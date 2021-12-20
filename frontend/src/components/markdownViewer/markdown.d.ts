export interface MarkdownItOptions {
    /** false.Set true to enable HTML tags in source.Be careful!
     * That's not safe! You may need external sanitizer to protect output from XSS.
     * It's better to extend features via plugins, instead of enabling HTML.
     */
    html?: boolean
    /**
     * false.Set true to add '/' when closing single tags(<br />).
     * This is needed only for full CommonMark compatibility.
     * In real world you will need HTML output.
     */
    xhtmlOut?: boolean
    /**
     * false.Set true to convert \n in paragraphs into<br>.
     */
    breaks?: boolean
    /**
     * language -.CSS language class prefix for fenced blocks.Can be useful for external highlighters.
     */
    langPrefix?: string
    /**
     * false.Set true to autoconvert URL - like text to links.
     */
    linkify?: boolean
    /**
     * false.Set true to enable some language - neutral replacement + quotes beautification(smartquotes).
     */
    typographer?: boolean
    /**
     * “”‘’, String or Array.Double + single quotes replacement pairs,
     * when typographer enabled and smartquotes on.For example, you can use '«»„“'
     * for Russian, '„“‚‘' for German, and['«\xA0', '\xA0»', '‹\xA0', '\xA0›']
     * for French(including nbsp).
     */
    quotes?: string | string[]
    /**
     * null.Highlighter function for fenced code blocks.
     * Highlighter function (str, lang) should return escaped HTML.
     * It can also return empty string if the source was not changed and should be escaped externaly.
     * If result starts with <pre...internal wrapper is skipped.
     */
    highlight?: ((str: string, lang: string) => string)
}

export interface LinkAttributesOpionsAttrs {
    /**
     * The browser target like '_blank' etc.
     */
    target?: string
    /**
     * Special the rel attribute like 'noopener' etc.
     */
    rel?: string
    /**
     * Special the css class.
     */
    class?: string
}

export interface HighlightOptions {
    /**
     * Whether to automatically detect language if not specified.
     */
    auto?: boolean | undefined;

    /**
     * Whether to add the `hljs` class to raw code blocks (not fenced blocks).
     */
    code?: boolean | undefined;

    /**
     * Register other languages which are not included in the standard pack.
     */
    register?: {
        [language: string]: (hljs?: HLJSApi) => Language;
    } | undefined;

    /**
     * Whether to highlight inline code.
     */
    inline?: boolean | undefined;
}

/**
 * The options of markdown-it-link-attributes
 * https://www.npmjs.com/package/markdown-it-link-attributes
 */
export interface LinkAttributesOpions {
    /**
     * You can also specify a pattern property.
     * The link's href property will be checked against the pattern RegExp provided
     * and only apply the attributes if it matches the pattern.
     */
    pattern: RegExp
    attrs: LinkAttributesOpionsAttrs
}

/**
 * The options of katex.
 * https://www.npmjs.com/package/markdown-it-katex
 */
export interface KatexOptions {
    katex?: typeof Katex
    blockClass?: string
}

export interface TOCOptions {
    includeLevel?: number[]
}

export interface MarkdownItVueOptions {
    highlight?: HighlightOptions;
    markdownIt?: MarkdownItOptions
    linkAttributes?: LinkAttributesOpions
    katex?: KatexOptions
    tasklists?: TasklistsOptions
    toc?: TOCOptions
}