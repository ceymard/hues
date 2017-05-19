
// import {_, K, Try, Op} from './rule'

import './languages/javascript'

import {Language} from './rule'

export function parse(str: string, lang: string): string {
  var l = Language.get(lang)
  if (!l) return str
  // console.time('test')
  var res = l.parse(str)
  // console.timeEnd('test')
  return res
}
