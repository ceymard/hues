

export class Stream {
  stack: number[] = []

  constructor(public arr: string[], public skip: RegExp, public position: number = 0) { }

  save() {
    this.stack.push(this.position)
  }

  rollback() {
    if (this.stack.length === 0) return
    this.position = this.stack.pop()!
  }

  commit() {
    if (this.stack.length === 0) return
    this.stack.pop()!
  }

  peek(): string|null {
    var res = this.arr[this.position]
    return res == null ? null : res
  }

  next(): string|null {
    var res = this.arr[this.position]
    if (res == null) return null

    this.position++
    return res
  }

}

export class Tokenizer {

  stream: string[] = []
  position: number = 0
  re: RegExp = /./

  constructor(...args: (string|RegExp)[]) {
    var tks = args.map(s => typeof(s) === 'string' ? s : s.source)
    this.re = new RegExp(`${tks.join('|')}`, 'g')
  }

  feed(str: string) {
    var re = this.re
    var exec

    var res = [] as string[]
    while (exec = re.exec(str)) {
      res.push(exec[0])
    }
    this.stream = res
    // resets the parser
    this.position = 0
  }
}