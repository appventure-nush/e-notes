import hljs from "highlight.js/lib/core";
import html from 'highlight.js/lib/languages/xml';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import plaintext from 'highlight.js/lib/languages/plaintext';
import yaml from 'highlight.js/lib/languages/yaml';

import 'highlight.js/styles/github.css'
import '@/plugins/hljs/hljs.scss';

hljs.registerLanguage('html', html);
hljs.registerLanguage('markdown', markdown);
hljs.registerAliases(['markdown', 'md', 'mkdown', 'mkd', 'markd'], {languageName: 'markdown'});
hljs.registerLanguage('python', python);
hljs.registerAliases(['python', 'py', 'gyp'], {languageName: 'python'});
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('yaml', yaml);
export default hljs;
