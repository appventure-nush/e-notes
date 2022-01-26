import core from "./core";
import hljs from '@/plugins/hljs';
import MarkdownIt, {PluginWithOptions} from 'markdown-it';
import {HLJSApi, LanguageFn} from "highlight.js";

export interface HighlightJsOptions {
    hljs?: HLJSApi,
    auto?: boolean | undefined;
    code?: boolean | undefined;
    register?: {
        [language: string]: LanguageFn;
    } | undefined;
    inline?: boolean | undefined;
}

const highlightjs: PluginWithOptions<HighlightJsOptions> = (md: MarkdownIt, opts?: HighlightJsOptions) => {
    opts = Object.assign({}, {
        auto: true,
        code: true,
        inline: false
    }, opts);
    if (!opts.hljs) opts.hljs = hljs;
    return core(md, opts)
}

export default highlightjs;