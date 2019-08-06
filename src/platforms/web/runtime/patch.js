/* @flow */

import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)
// vm.prototype_patch_  nodeOps封装类一系列dom操作的方法，modules定义类一些模块钩子函数的实现
// 函数柯里化，这边传入一些配置dom操作和模块钩子函数，然后在外层vm.__patch__传入return回来的函数
export const patch: Function = createPatchFunction({ nodeOps, modules })
