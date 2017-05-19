
// import {_, K, Try, Op} from './rule'

import './languages/javascript'

import {Language} from './rule'

export function parse(str: string, lang: string): string {
  var l = Language.get(lang)
  if (!l) return str
  return l.parse(str)
}
