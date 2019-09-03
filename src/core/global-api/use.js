/* @flow */

import { toArray } from '../util/index'

export function initUse(Vue: GlobalAPI) {
  Vue.use = function(plugin: Function | Object) {
    // installPlugins保存已经注册的插件，是一个数组
    const installedPlugins =
      this._installedPlugins || (this._installedPlugins = [])
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    const args = toArray(arguments, 1)
    args.unshift(this)
    // 这个install是静态的
    // 当我们执行Vue.use注册插件的时候，就会执行这个install方法，并且在这个install方法中第一个参数
    // 我们可以拿到Vue对象
    if (typeof plugin.install === 'function') {
      // arg此时指向Vue实例
      // args作为参数传递给plugin.install，其中plugin.install中的this指向指向plugin
      // 这里其实就是把vue实例传给plugin
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}
