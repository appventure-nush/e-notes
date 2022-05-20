import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import Renderer, {RenderRule} from 'markdown-it/lib/renderer';
import {HighlightJsOptions} from "@/plugins/markdown-highlight-js/index";
import {HLJSApi, LanguageFn} from "highlight.js";
import vuetify from "@/plugins/vuetify"

function maybe(f: () => any) {
    try {
        return f()
    } catch (e) {
        return false
    }
}

const pyscript = (code: string) => `<py-repl theme="${vuetify.framework.theme.dark ? 'dark' : 'light'}" auto-generate="true">${code}</py-repl>`
const pyscriptRead = (code: string) => `<py-script theme="${vuetify.framework.theme.dark ? 'dark' : 'light'}">${code}</py-script>`
const registerLangs = (hljs: HLJSApi, register?: { [key: string]: LanguageFn }) => register &&
    Object.entries(register).map(([lang, pack]) => {
        hljs.registerLanguage(lang, pack)
    })

const highlight = (hljs: HLJSApi, code: string, lang?: string) =>
    lang === 'py.box' ? pyscript(code) :
        lang === 'py.script' ? pyscriptRead(code) :
            lang + maybe(() => hljs.highlight(code, {language: lang || 'plaintext', ignoreIllegals: true}).value) || ''

const highlightAuto = (hljs: HLJSApi, code: string, lang?: string) =>
    lang
        ? lang === 'py.box' ? pyscript(code) :
            lang === 'py.script' ? pyscriptRead(code) : highlight(hljs, code, lang)
        : lang + maybe(() => hljs.highlightAuto(code).value) || ''

const wrap = (render: RenderRule | undefined) =>
    (((tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) =>
        render && render(tokens, idx, options, env, self)
            .replace('<code class="', '<code class="hljs ')
            .replace('<code>', '<code class="hljs">')) as RenderRule)

function inlineCodeRenderer(md: MarkdownIt, tokens: Token[], idx: number, options: MarkdownIt.Options) {
    const code = tokens[idx]
    const next = tokens[idx + 1]
    let lang

    if (next && next.type === 'text') {
        const match = /^{:?\.([^}]+)}/.exec(next.content)
        if (match) {
            lang = match[1]
            next.content = next.content.slice(match[0].length)
        }
    }

    const highlighted = options.highlight && options.highlight(code.content, lang || '', '')
    const cls = lang ? ` class="${options.langPrefix}${md.utils.escapeHtml(lang)}"` : ''

    return `<code${cls}>${highlighted}</code>`
}

export default (md: MarkdownIt, opts: HighlightJsOptions) => {
    if (!opts || !opts.hljs) throw new Error('Please pass a highlight.js instance for the required `hljs` option.')
    registerLangs(opts.hljs, opts.register)
    md.options.highlight = (opts.auto ? highlightAuto : highlight).bind(null, opts.hljs)
    md.renderer.rules.fence = wrap(md.renderer.rules.fence)
    if (opts.code) md.renderer.rules.code_block = wrap(md.renderer.rules.code_block)
    if (opts.inline) md.renderer.rules.code_inline = inlineCodeRenderer.bind(null, md)
}
