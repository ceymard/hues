

export class Stream {
  stack: number[] = []
  position = 0

  constructor(public arr: string[], public skip: RegExp) { }

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

  re: RegExp = /./

  constructor(...args: (string|RegExp)[]) {
    var tks = args.map(s => typeof(s) === 'string' ? s : s.source)
    this.re = new RegExp(`${tks.join('|')}`, 'g')
  }

  feed(str: string): string[] {
    var re = this.re
    var exec

    var res = [] as string[]
    while (exec = re.exec(str)) {
      res.push(exec[0])
    }
    return res
  }
}