import * as d2h from 'diff2html'
import hljs from '@/plugins/hljs'
import {createPatch} from "diff";
import CodeDiff from "@/components/diff/CodeDiff.vue";

export const createHtml = (props: CodeDiff) => {
    let oldString = props.trim ? props.oldString.trim() : props.oldString
    let newString = props.trim ? props.newString.trim() : props.newString
    oldString = props.noDiffLineFeed ? oldString.replace(/(\r\n)/g, '\n') : oldString
    newString = props.noDiffLineFeed ? newString.replace(/(\r\n)/g, '\n') : newString
    let context = props.context
    if (props.isShowNoChange && oldString && newString && oldString === newString) {
        oldString = '=========== OLD ===========\n' + oldString
        newString = '=========== NEW ===========\n' + newString
        context = 99999
    }
    const dd = createPatch(props.fileName, oldString, newString, '', '', {context: context})
    return d2h.html(dd, {
        outputFormat: props.outputFormat,
        drawFileList: props.drawFileList,
        matching: 'lines',
        diffStyle: props.diffStyle,
        renderNothingWhenEmpty: props.renderNothingWhenEmpty
    })
}

async function listElements(element: Element): Promise<Element[]> {
    return new Promise(resolve => {
        setTimeout(() => {
            const elements = element.querySelectorAll('.d2h-wrapper .d2h-code-line-ctn')
            resolve(Array.from(elements))
        }, 0)
    })
}

async function highlightElement(el: HTMLElement, language: string): Promise<boolean> {
    return new Promise(resolve => {
        setTimeout(() => {
            if (language) {
                const text = el.innerText
                el.innerHTML = hljs.highlight(text, {language: language}).value
            } else {
                hljs.highlightElement(<HTMLElement>el)
            }
            resolve(true)
        }, 0)
    })
}

export async function highlightElements(element: Element, props: CodeDiff) {
    const elements = await listElements(element)
    const promises = Array.from(elements).map(el => highlightElement(el as HTMLElement, props.language))
    await Promise.all(promises)
}

export function syncScroll(param: HTMLElement, selector: string) {
    let active: HTMLElement = document.createElement('div')
    const elements = param.querySelectorAll(selector);
    elements.forEach(element => {
        element.addEventListener('mouseenter', e => active = e.target as HTMLElement)
        element.addEventListener('scroll', e => {
            if (e.target !== active) return
            elements.forEach(target => {
                if (active === target) return
                target.scrollTop = active.scrollTop
                target.scrollLeft = active.scrollLeft
            })
        })
    })
}
