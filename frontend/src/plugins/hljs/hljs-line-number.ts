type Options = { singleLine: boolean, startFrom: number }
const TABLE_NAME = 'hljs-ln',
    LINE_NAME = 'hljs-ln-line',
    CODE_BLOCK_NAME = 'hljs-ln-code',
    NUMBERS_BLOCK_NAME = 'hljs-ln-numbers',
    NUMBER_LINE_NAME = 'hljs-ln-n',
    DATA_ATTR_NAME = 'data-line-number',
    BREAK_LINE_REGEXP = /\r\n|\r|\n/g;

function isHljsLnCodeDescendant(domElt: HTMLElement) {
    let curElt = domElt;
    while (curElt) {
        if (curElt.className && curElt.className.indexOf('hljs-ln-code') !== -1) return true;
        curElt = curElt.parentNode as HTMLElement;
    }
    return false;
}

function getHljsLnTable(hljsLnDomElt: HTMLElement) {
    let curElt = hljsLnDomElt;
    while (curElt.nodeName !== 'TABLE') curElt = curElt.parentNode as HTMLElement;
    return curElt;
}

// Function to workaround a copy issue with Microsoft Edge.
// Due to hljs-ln wrapping the lines of code inside a <table> element,
// itself wrapped inside a <pre> element, window.getSelection().toString()
// does not contain any line breaks. So we need to get them back using the
// rendered code in the DOM as reference.
function edgeGetSelectedCodeLines(selection: Selection) {
    // current selected text without line breaks
    const selectionText = selection.toString();

    // get the <td> element wrapping the first line of selected code
    let tdAnchor = selection.anchorNode as HTMLElement;
    while (tdAnchor?.nodeName !== 'TD') tdAnchor = tdAnchor?.parentNode as HTMLElement;

    // get the <td> element wrapping the last line of selected code
    let tdFocus = selection.focusNode as HTMLElement;
    while (tdFocus?.nodeName !== 'TD') tdFocus = tdFocus?.parentNode as HTMLElement;

    // extract line numbers
    let firstLineNumber = parseInt(tdAnchor?.dataset?.lineNumber ?? '0');
    let lastLineNumber = parseInt(tdFocus?.dataset?.lineNumber ?? '0');

    // multi-lines copied case
    if (firstLineNumber != lastLineNumber) {

        let firstLineText = tdAnchor.textContent;
        let lastLineText = tdFocus.textContent;

        // if the selection was made backward, swap values
        if (firstLineNumber > lastLineNumber) {
            const tmp = firstLineNumber;
            firstLineNumber = lastLineNumber;
            lastLineNumber = tmp;
            const tmp2 = firstLineText;
            firstLineText = lastLineText;
            lastLineText = tmp2;
        }

        // discard not copied characters in first line
        while (firstLineText && selectionText.indexOf(firstLineText) !== 0) firstLineText = firstLineText.slice(1);

        // discard not copied characters in last line
        while (lastLineText && selectionText.lastIndexOf(lastLineText) === -1) lastLineText = lastLineText.slice(0, -1);

        // reconstruct and return the real copied text
        let selectedText = firstLineText;
        const hljsLnTable = getHljsLnTable(tdAnchor);
        for (let i = firstLineNumber + 1; i < lastLineNumber; ++i) {
            const codeLineSel = format('.{0}[{1}="{2}"]', [CODE_BLOCK_NAME, DATA_ATTR_NAME, i]);
            const codeLineElt = hljsLnTable.querySelector(codeLineSel);
            selectedText += '\n' + codeLineElt?.textContent;
        }
        selectedText += '\n' + lastLineText;
        return selectedText;
        // single copied line case
    } else {
        return selectionText;
    }
}

// ensure consistent code copy/paste behavior across all browsers
// (see https://github.com/wcoder/highlightjs-line-numbers.js/issues/51)
document.addEventListener('copy', function (e) {
    // get current selection
    const selection = window.getSelection();
    if (!selection) return
    // override behavior when one wants to copy line of codes
    if (isHljsLnCodeDescendant(selection.anchorNode as HTMLElement)) {
        const selectionText = window.navigator.userAgent.indexOf('Edge') !== -1 ? edgeGetSelectedCodeLines(selection) : selection.toString();
        // workaround an issue with Microsoft Edge as copied line breaks
        // are removed otherwise from the selection string
        e.clipboardData?.setData('text/plain', selectionText ?? '');
        e.preventDefault();
    }
});

export function lineNumbersBlock(element: Element, options: Options) {
    if (typeof element !== 'object') return;

    async(function () {
        element.innerHTML = lineNumbersInternal(element, options);
    });
}

function lineNumbersInternal(element: Element, options: Options) {

    const internalOptions = mapOptions(element, options);

    duplicateMultilineNodes(element);

    return addLineNumbersBlockFor(element.innerHTML, internalOptions);
}

function addLineNumbersBlockFor(inputHtml: string, options: Options) {
    const lines = getLines(inputHtml);

    // if last line contains only carriage return remove it
    if (lines[lines.length - 1]?.trim() === '') {
        lines.pop();
    }

    if (lines.length > 1 || options.singleLine) {
        let html = '';
        const l = lines.length
        for (let i = 0; i < l; i++) {
            html += format(
                "<tr><td class=\"{0} {1}\" {3}=\"{5}\"><div class=\"{2}\" {3}=\"{5}\"></div></td><td class=\"{0} {4}\" {3}=\"{5}\">{6}</td></tr>",
                [
                    LINE_NAME,
                    NUMBERS_BLOCK_NAME,
                    NUMBER_LINE_NAME,
                    DATA_ATTR_NAME,
                    CODE_BLOCK_NAME,
                    i + options.startFrom,
                    lines[i].length > 0 ? lines[i] : ' '
                ]);
        }

        return format('<table class="{0}">{1}</table>', [TABLE_NAME, html]);
    }

    return inputHtml;
}

/**
 * @param {HTMLElement} element Code block.
 * @param {Object} options External API options.
 * @returns {Object} Internal API options.
 */
function mapOptions(element: Element, options: Options) {
    options = options || {};
    return {
        singleLine: getSingleLineOption(options),
        startFrom: getStartFromOption(element, options)
    };
}

function getSingleLineOption(options: Options) {
    const defaultValue = false;
    if (options.singleLine) return options.singleLine;
    else return defaultValue;
}

function getStartFromOption(element: Element, options: Options) {
    const defaultValue = 1;
    let startFrom = defaultValue;

    if (isFinite(options.startFrom)) {
        startFrom = options.startFrom;
    }

    // can be overridden because local option is priority
    const value = getAttribute(element, 'data-ln-start-from');
    if (value !== null) {
        startFrom = toNumber(value, defaultValue);
    }

    return startFrom;
}

/**
 * Recursive method for fix multi-line elements implementation in highlight.js
 * Doing deep passage on child nodes.
 * @param {HTMLElement} element
 */
function duplicateMultilineNodes(element: Element) {
    const nodes = element.childNodes;
    for (const node in nodes) {
        const child = nodes[node];
        if (getLinesCount(child.textContent) > 0) {
            if (child.childNodes.length > 0) {
                duplicateMultilineNodes(child as Element);
            } else {
                duplicateMultilineNode(child.parentNode as Element);
            }
        }
    }
}

/**
 * Method for fix multi-line elements implementation in highlight.js
 * @param {HTMLElement} element
 */
function duplicateMultilineNode(element: Element) {
    let result = '';
    const className = element.className;

    if (!/hljs-/.test(className)) return;

    const lines = getLines(element.innerHTML);

    for (let i = 0; i < lines.length; i++) {
        const lineText = lines[i].length > 0 ? lines[i] : ' ';
        result += format('<span class="{0}">{1}</span>\n', [className, lineText]);
    }
    element.innerHTML = result.trim();
}

function getLines(text: string) {
    if (text.length === 0) return [];
    return text.split(BREAK_LINE_REGEXP);
}

function getLinesCount(text?: string | null) {
    return (text?.trim().match(BREAK_LINE_REGEXP) || []).length;
}

///
/// HELPERS
///

function async(func: () => any) {
    setTimeout(func, 0);
}

/**
 * {@link https://wcoder.github.io/notes/string-format-for-string-formating-in-javascript}
 * @param {string} format
 * @param {array} args
 */
function format(format: string, args: any[]) {
    return format.replace(/\{(\d+)}/g, function (m, n) {
        return args[n] !== undefined ? args[n] : m;
    });
}

/**
 * @param {HTMLElement} element Code block.
 * @param {String} attrName Attribute name.
 * @returns {String} Attribute value or empty.
 */
function getAttribute(element: Element, attrName: string) {
    return element.hasAttribute(attrName) ? element.getAttribute(attrName) : null;
}

/**
 * @param {String} str Source string.
 * @param {Number} fallback Fallback value.
 * @returns Parsed number or fallback value.
 */
function toNumber(str: string, fallback: number) {
    if (!str) return fallback;
    const number = Number(str);
    return isFinite(number) ? number : fallback;
}
