/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function humanFileSize(bytes: number, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
}

import {Route} from 'vue-router'

export function isCollectionRoute(route: Route) {
    return route.path.startsWith('/collection/');
}

const rgx = new RegExp(/([a-zA-Z])[a-zA-Z]+/, 'gu');

export function initials(name: string) {
    if (!name) return '';
    const initials = [...name.matchAll(rgx)] || [];
    return (
        (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
    ).toUpperCase();
}

function intToHSL(number: number) {
    return "hsl(" + number % 360 + ",50%,30%)";
}

export function getHashCode(string?: string) {
    if (!string) return 'brown';
    let hash = 0;
    if (string.length == 0) return hash;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    return intToHSL(hash);
}

export function requestedDarkMode(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function requestDarkModeListener(callback: (e: MediaQueryListEvent | MediaQueryList) => void) {
    callback(window.matchMedia('(prefers-color-scheme: dark)'));
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', callback);
}

export function removeDarkModeListener(callback: (e: MediaQueryListEvent | MediaQueryList) => void) {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', callback);
}

function b64ToBlob(base64: string, type: string) {
    const decodedData = window.atob(base64);

    const uInt8Array = new Uint8Array(decodedData.length);

    for (let i = 0; i < decodedData.length; ++i) {
        uInt8Array[i] = decodedData.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type});
}

const B64_IMAGE_CACHE: { [b64: string]: string } = {};

export function b64ToUrl(base64: string, type: string) {
    return B64_IMAGE_CACHE[base64] || (B64_IMAGE_CACHE[base64] = URL.createObjectURL(b64ToBlob(base64, type)));
}

export function normaliseJupyterOutput(input: string | string[]): string {
    if (typeof input === 'string') return input;
    else return input.join('');
}

export function denormaliseJupyterOutput(input: string): string[] {
    return input.split("\n").map((s, i, a) => i === a.length - 1 ? s : s + "\n")
}
