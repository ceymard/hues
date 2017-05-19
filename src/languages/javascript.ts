/**
 * Javascript, JSX, Typescript and TSX are covered
 * by this mode.
 *
 * This should also highlight Flow type highlights.
 */

import {
  Any,
  Either, Try, Re, _, O, Rule, LookAhead, K, Optional, Str, Z,
  Language
} from '../rule'


const KEYWORDS = K(
  'abstract',
  'any',
  'as',
  'async',
  'await',
  'boolean',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'constructor',
  'continue',
  'debugger',
  'declare',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'finally',
  'for',
  'from',
  'function',
  'get',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'module',
  'namespace',
  'new',
  'number',
  'of',
  'package',
  'private',
  'protected',
  'public',
  'require',
  'return',
  'set',
  'static',
  'string',
  'switch',
  'symbol',
  'throw',
  'try',
  'type',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
)

const LITERALS = Str(
  'false',
  'NaN',
  'null',
  'super',
  'this',
  'true',
  'undefined',
).class('literal')

const ID = Re(/^[$a-zA-Z\u00C0-\u017F_][$a-zA-Z\u00C0-\u017F_0-9]*$/)


const LBRACKET = O('{')
const RBRACKET = O('}')
const LPAREN = O('(')
const RPAREN = O(')')
const COLON = O(':')
const SEMICOLON = O(';')
const INTERROGATION = O('?')
// const EXCLAM = Op('!')
// const COMMA = Op(',')
const DOT = O('.')
const ASSIGN = O('=')

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
  O('`'),
  Try(_(O('${'), Try(TOPLEVEL).until(LookAhead('}')).class('toplevel typescript'), O('}')).class('typescript'))
    .until(O('`'))
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

const DOTTED_NAME = _(ID, Z(DOT, ID))

// Used to swallow properties that would otherwise be keywords
const DOTTED_GUARD = _(DOT, Either(
  _(ID.class('function-call'), LookAhead(LPAREN)),
  ID
))

///////////////////////////////////////////////////////////////

const DECORATOR = _(
  O('@'),
  DOTTED_NAME.class('tag-name')
).class('decorator')

const OBJECT_PROPERTY = _(
  Either(ID, SIMPLE_STRING).class('property'),
  Optional(INTERROGATION),
  COLON
)


//////////////////////////////////////////////////////////////

const TYPE_DECL = _()

const ARGUMENTS = _()

const METHOD = _(
  ID.class('function method'),
  ARGUMENTS,
  Either(CODE_BLOCK, SEMICOLON)
)

const CLASS_PROPERTY = _(
  OBJECT_PROPERTY,
  Optional(TYPE_DECL)
)

const TYPE_BODY = _(
  LBRACKET,
  Try(Either(
    DECORATOR,
    METHOD,
    CLASS_PROPERTY,
    TOPLEVEL
  )).until(LookAhead(RBRACKET)),
  RBRACKET
)

const TYPE_GENERIC_DECL = _(TYPE_DECL, Optional(O('='), TYPE_DECL))
const TYPE_GENERIC = _(O('<'), TYPE_GENERIC_DECL, Z(O(','), TYPE_GENERIC_DECL), O('>'))

TYPE_DECL.define(
  _(
    Either(
      _(ID, Optional(TYPE_GENERIC), Optional('[', ']')),
      SIMPLE_STRING,
      NUMBER,
      TYPE_BODY
    ),
    Z(
      O('|', '&'),
      TYPE_DECL
    )
  ).class('type')
)

const TYPE_DEF = Either(
  _(K('type'), TYPE_DECL, O('='), TYPE_DECL),
  _(
    Either(K('interface'), K('class')),
    TYPE_DECL,
    Optional(K('extends'), TYPE_DECL),
    TYPE_BODY
  )
)

const TYPED_VAR = Either(
  _(ID, O(':'), TYPE_DECL),
  _(K('as'), TYPE_DECL)
)

//////////////////////////////////////////////////////////////

const TYPE_BLOCK = _(
  COLON,
  TYPE_DECL
)

const SINGLE_ARGUMENT = _(
  Optional(K('public', 'private', 'protected')),
  ID.class('argument'),
  Optional(TYPE_BLOCK),
  Optional(
    O('='),
    Try(TOPLEVEL).until(LookAhead(Either(')', ',')))
  ),
  Optional(O(','))
)

ARGUMENTS.define(
  O('('),
  Z(SINGLE_ARGUMENT),
  O(')'),
  Optional(TYPE_BLOCK)
)

const NAMED_FUNCTION = _(
  K('function'),
  Optional(ID).class('function'),
  Optional(TYPE_GENERIC.class('type')),
  ARGUMENTS,
  CODE_BLOCK
).class('function-declaration')

const ARROW_FUNCTION = _(
  Either(_(Optional(TYPE_GENERIC.class('type')), ARGUMENTS), ID),
  O('=>'),
  Optional(CODE_BLOCK)
)

const FUNCTION = Either(NAMED_FUNCTION, ARROW_FUNCTION)

const FUNCTION_CALL = _(ID.class('function-call'), LookAhead(LPAREN))

//////////////////////////////////////////////////////////////

OBJECT_LITERAL.define(
  LBRACKET,
  LookAhead(Either(OBJECT_PROPERTY, RBRACKET, METHOD)),
  Try(Either(
    OBJECT_PROPERTY,
    METHOD,
    TOPLEVEL,
  )).until(LookAhead(RBRACKET)),
  RBRACKET
).class('object')

// Missing the object type declaration.

///////////////////////////////////////////////////////////////////

const VALID_ATTRIBUTE_NAME = _(ID, Z('-', ID)).class('attribute')

const ATTRIBUTE = _(VALID_ATTRIBUTE_NAME, Optional(Either(
  _(ASSIGN, LBRACKET, Try(TOPLEVEL).until(LookAhead(RBRACKET)).class('toplevel typescript'), RBRACKET),
  _(ASSIGN, SIMPLE_STRING)
)))

const OPENING_TAG_START = _('<', DOTTED_NAME, Z(ATTRIBUTE))

const OPENING_TAG = _(OPENING_TAG_START, '>').class('tag')
const SELF_CLOSING_TAG = _(OPENING_TAG_START, '/>').class('tag')
const CLOSING_TAG = _('</', DOTTED_NAME, '>').class('tag')
const HTML_ENTITY = _(O('&'), ID, O(';')).class('entity')

const _JSX = _()

_JSX.define(Either(
  _(OPENING_TAG, Try(
    _JSX,
    HTML_ENTITY,
    CODE_BLOCK.class('toplevel typescript')
  ).until(CLOSING_TAG)),
  SELF_CLOSING_TAG
))

const JSX = _JSX.class('jsx')

///////////////////////////////////////////////////////////////////

TOPLEVEL.define(Either(
  COMMENT,
  STRING,
  NUMBER,
  TYPE_DEF,
  TYPED_VAR,
  FUNCTION,
  JSX,
  OBJECT_LITERAL,
  CODE_BLOCK,
  DOTTED_GUARD,
  KEYWORDS,
  LITERALS,
  FUNCTION_CALL,
))

const LANGUAGE = Try(TOPLEVEL)

Language.create(LANGUAGE, /^[\t\n\r ]+$/,
  /===|!==|==|!=|>=|<=/,
  /&&|\|\|/,
  /<<|\/>|<\//,
  /\+=|\*=|\/=|%=/,
  /\$\{/,
  /\+\+|\-\-/,
  /\/\*|\*\/|\/\//, // comments
  /[$a-zA-Z\u00C0-\u017F0-9_]+/, // idents and numbers
  /[\t \r]+|\n/,
  /./
).alias(
  'ts',
  'js',
  'tsx',
  'jsx',
  'javascript',
  'typescript',
  'react'
)
