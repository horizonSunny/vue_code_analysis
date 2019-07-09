/* @flow */
//
import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import {
  shouldDecodeNewlines,
  shouldDecodeNewlinesForHref
} from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

const mount = Vue.prototype.$mount
Vue.prototype.$mount = function(
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 找到dom节点
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' &&
      warn(
        `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
      )
    return this
  }
  // 因为在对象上，这里的this指向Vue.prototype,看new app上option配置中有没有render函数
  // 这里的$options是在Vue对象创建的时候合并options配置项拿到的
  const options = this.$options
  // resolve template/el and convert to render function
  // 假如不是render函数的话，是template,转成render函数，这块都是处理template转成render函数(可能是因为compile方式的原因)
  if (!options.render) {
    // 为模版重新赋值，为后面转译成render函数做准备
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          // 查询id的值
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        //标记 编译
        mark('compile')
      }
      // 上面是找到template模版
      // 这边应该依据找到的template生成render函数，es6解构赋值,这下面是编译的函数
      // 这便是形成render函数
      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          outputSourceRange: process.env.NODE_ENV !== 'production',
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments
        },
        this
      )
      // 这边给Vue.prototype.$options赋值属性(准确的说是生成的对象)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // call这个this对象，指的的是new 生成的实例
  // 这块就走回刚才缓存的 const mount = Vue.prototype.$mount
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML(el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue

/** 
 * 这段代码首先缓存了原型上的$mount方法，再重新定义该方法。首先它对el做了限制，vue不能
   挂载到body，html这样对根节点上。接下来是关键对逻辑。如果没有定义render方法，则会把el
 或者template字符串转成render方法。
    所有的Vue的组件的渲染最终都需要render方法，无论我们是用单文件.vue方式开发组件
    还是写el或者template属性，最终都会转换成render方法，这个过程是Vue的一个‘在线编译’的过程
  它是调用compileToFuncitons方法实现的。
    $mount方法支持传入2个参数，第一个是el，它表示挂载的元素，可以是字符串，也可以是dom对象
  如果字符串在浏览器环境下会调用query方法转换成dom对象的。第二个参数是和服务端渲染相关。浏览器环境下
  不需要传入第二个参数
*/
