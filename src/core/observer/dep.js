/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

// dep的操作全都是与watch相关的，dep脱离watcher单独存在是没有意义的
/**
 * Dep.tagert静态属性就是一个watcher
 */
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  // 静态，作为全局的唯一的收集器，dep是对watcher的一种管理，脱离watcher单独存在是无意义的
  static target: ?Watcher
  id: number
  subs: Array<Watcher>
  // 所以是每一个组件中的data或者data中嵌套的子对象做响应监听，就加一
  constructor() {
    this.id = uid++
    // 派发事件的数组，notify之后派发事件
    this.subs = []
  }

  addSub(sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub(sub: Watcher) {
    remove(this.subs, sub)
  }

  depend() {
    if (Dep.target) {
      // 在watch中赋值给当前渲染watch
      Dep.target.addDep(this)
    }
  }

  notify() {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
// Dep.target 这个是全局唯一的watcher，同一时间只有一个全局的watcher被计算，
Dep.target = null
const targetStack = []

export function pushTarget(target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
