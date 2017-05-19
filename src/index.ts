
// import {_, K, Try, Op} from './rule'

import {LANGUAGE} from './languages/javascript'

import {Tokenizer, Stream} from './tokenizer'


export function parse(str: string): string {
  var tk = new Tokenizer(
    /===|!==|==|!=|>=|<=/,
    /&&|\|\|/,
    />>>|>>|<<|\/>|<\//,
    /\+=|\*=|\/=|%=/,
    /\$\{/,
    /\+\+|\-\-/,
    /\/\*|\*\/|\/\//, // comments
    /[a-zA-Z\u00C0-\u017F0-9_]+/, // idents and numbers
    /[\t \r]+|\n/,
    /./
  )
  tk.feed(str)
  var s = new Stream(tk.stream, /^[\t\n\r ]+$/)
  return (LANGUAGE.run(s)||[]).map(s => typeof s === 'string' ?
      s.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
    : s).join('')
}