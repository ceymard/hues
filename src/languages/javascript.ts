/**
 * Javascript, JSX, Typescript and TSX are covered
 * by this mode.
 *
 * This should also highlight Flow type highlights.
 */

import {
  Any,
  Either, Try, Re, _, Op, Rule, LookAhead, TryRule, K, Optional, Str, ZeroOrMore
} from '../rule'


const KEYWORDS = K(
  'import', 'from', 'export',
  'var', 'let', 'const',
  'new', 'as',
  'type', 'class', 'interface', 'extends',
  'if', 'for', 'while', 'switch', 'case', 'default',
  'declare', 'public', 'private', 'protected',
  'namespace',
  'return', 'break', 'continue'
)

const LITERALS = Str(
  'null', 'undefined', 'true', 'false', 'NaN'
).class('literal')

const ID = Re(/[a-zA-Z\u00C0-\u017F_][a-zA-Z\u00C0-\u017F_0-9]*/)


const LBRACKET = Op('{')
const RBRACKET = Op('}')
const LPAREN = Op('(')
const RPAREN = Op(')')
const COLON = Op(':')
const SEMICOLON = Op(';')
const INTERROGATION = Op('?')
// const EXCLAM = Op('!')
// const COMMA = Op(',')
const DOT = Op('.')
const ASSIGN = Op('=')

const TOPLEVEL = _() as Rule

const CHAR_ESCAPE = _('\\', Re(/./)).class('char-escape')

const NUMBER = _(
  /^[0-9]+$/,
  Optional(
    DOT,
    /^[0-9]+$/
  )
).class('number')

// basic strings
const SIMPLE_STRING = Either(
  _('"', Try(CHAR_ESCAPE).until('"')),
  _("'", Try(CHAR_ESCAPE).until("'"))
).class('string')

const TEMPLATE_STRING = _(
  '`',
  Try(_('${', Try(TOPLEVEL).until('}')).class('typescript'))
    .until('`')
).class('string template-string')

const STRING = Either(SIMPLE_STRING, TEMPLATE_STRING)

//////////////////////////////////////////////////////////////

const COMMENT = Either(
  _('//', Try(Any).until(LookAhead('\n'))),
  _('/*', Try(Any).until('*/'))
).class('comment')

const CODE_BLOCK = _(LBRACKET, Try(TOPLEVEL).until(LookAhead(RBRACKET)), RBRACKET)

// Forward declaration
const OBJECT_LITERAL = _()

//////////////////////////////////////////////////////////////

const _TYPE_DECL = _()

_TYPE_DECL.define(
  Either(
    _(ID, Optional(Op('<'), _TYPE_DECL, Op('>')), Optional('[', ']')),
    SIMPLE_STRING,
    OBJECT_LITERAL
  ),
  ZeroOrMore(
    Either(Op('|'), Op('&')),
    _TYPE_DECL
  )
)

const TYPE_DECL = _TYPE_DECL.class('type')

const TYPE_DEF = Either(
  _(K('type'), TYPE_DECL, Op('='), TYPE_DECL),
  _(
    Either(K('interface'), K('class')),
    TYPE_DECL,
    Optional(K('extends'), TYPE_DECL)
  )
)

const TYPED_VAR = Either(
  _(ID, Op(':'), TYPE_DECL),
  _(K('as'), TYPE_DECL)
)

//////////////////////////////////////////////////////////////

const TYPE_BLOCK = _(
  COLON,
  TYPE_DECL
)

const ARGUMENTS = _(
  LPAREN,
  // FIXME, type is more than just an ID !!!
  Try(_(ID.class('argument'), Optional(TYPE_BLOCK))).until(LookAhead(RPAREN)),
  RPAREN,
  Optional(TYPE_BLOCK)
)

const METHOD = _(
  ID.class('function method'),
  ARGUMENTS,
  Either(CODE_BLOCK, SEMICOLON)
)

const NAMED_FUNCTION = _(
  K('function'),
  Optional(ID).class('function'),
  ARGUMENTS,
  CODE_BLOCK
)

const ARROW_FUNCTION = _(
  ARGUMENTS,
  Op('=>'),
  Optional(CODE_BLOCK)
)

const FUNCTION = Either(NAMED_FUNCTION, ARROW_FUNCTION)

//////////////////////////////////////////////////////////////

const OBJECT_PROPERTY = _(
  Either(ID, SIMPLE_STRING).class('property'),
  Optional(INTERROGATION),
  COLON
)

const DOTTED_NAME = _(ID, ZeroOrMore(DOT, ID)).class('tagname')

const DECORATOR = _(
  Op('@'),
  DOTTED_NAME
).class('decorator')

OBJECT_LITERAL.define(
  LBRACKET,
  LookAhead(Either(OBJECT_PROPERTY, RBRACKET, METHOD)),
  Try(Either(
    DECORATOR,
    OBJECT_PROPERTY,
    METHOD,
    TOPLEVEL,
  )).until(LookAhead(RBRACKET)),
  RBRACKET
).class('object')

///////////////////////////////////////////////////////////////////

const VALID_ATTRIBUTE_NAME = _(ID, ZeroOrMore('-', ID)).class('attribute')

const ATTRIBUTE = _(VALID_ATTRIBUTE_NAME, Optional(Either(
  _(ASSIGN, LBRACKET, Try(TOPLEVEL).until(LookAhead(RBRACKET)).class('toplevel typescript'), RBRACKET),
  _(ASSIGN, SIMPLE_STRING)
)))
const OPENING_TAG = _('<', DOTTED_NAME, Try(ATTRIBUTE).until(Either('>', '/>'))).class('tag')
const CLOSING_TAG = _('</', DOTTED_NAME, '>').class('tag')

const JSX = _()
JSX.define(OPENING_TAG, Try(JSX).until(CLOSING_TAG))

///////////////////////////////////////////////////////////////////

TOPLEVEL.define(Either(
  COMMENT,
  STRING,
  NUMBER,
  TYPE_DEF,
  TYPED_VAR,
  FUNCTION,
  OPENING_TAG,
  CLOSING_TAG,
  OBJECT_LITERAL,
  CODE_BLOCK,
  KEYWORDS,
  LITERALS
))

export const LANGUAGE: TryRule = Try(TOPLEVEL)
