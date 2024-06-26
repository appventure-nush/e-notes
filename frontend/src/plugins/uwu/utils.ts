/**
 * Credits: https://github.com/Schotsl/Uwuifier-node
 * Taken directly due to incompatible build
 */
function isLetter(char: string) {
    return /^\p{L}/u.test(char);
}

function isUpperCase(char: string) {
    return char === char.toUpperCase();
}

export function getCapitalPercentage(str: string): number {
    let totalLetters = 0;
    let upperLetters = 0;

    for (const currentLetter of str) {
        if (!isLetter(currentLetter)) continue;

        if (isUpperCase(currentLetter)) {
            upperLetters++;
        }

        totalLetters++;
    }

    return upperLetters / totalLetters;
}

export function InitModifierParam() {
    return (target: { [key: string]: any }, key: string): void => {
        let value = target[key];
        let sum = 0;

        const getter = () => value;
        const setter = (next: number | Record<string, number>) => {
            if (typeof next === "object") {
                sum = Object.values(next).reduce((a, b) => a + b);
            }

            if (next < 0 || sum < 0 || next > 1 || sum > 1) {
                throw new Error(
                    `${key} modifier value must be a number between 0 and 1`,
                );
            }

            value = next;
        };

        Object.defineProperty(target, key, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true,
        });
    };
}

export function isUri(value: string): boolean {
    if (!value) return false;

    // Check for illegal characters
    if (/[^a-z0-9:\\/?#[\]@!$&'()*+,;=.\-_~%]/i.test(value)) return false;

    // Check for hex escapes that aren't complete
    if (/%[^0-9a-f]/i.test(value) || /%[0-9a-f](:?[^0-9a-f]|$)/i.test(value)) return false;

    // Directly from RFC 3986
    const split = value.match(/(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/,);

    if (!split) return false;

    const [, scheme, authority, path] = split;

    // Scheme and path are required, though the path can be empty
    if (!(scheme && scheme.length && path.length >= 0)) return false;

    // If authority is present, the path must be empty or begin with a /
    if (authority && authority.length) if (!(path.length === 0 || /^\//.test(path))) return false;
    else
        // If authority is not present, the path must not start with //
    if (/^\/\//.test(path)) return false;

    // Scheme must begin with a letter, then consist of letters, digits, +, ., or -
    return /^[a-z][a-z0-9+\-.]*$/.test(scheme.toLowerCase());
}

export function isAt(value: string): boolean {
    // Check if the first character is '@'
    const first = value.charAt(0);
    return first === "@";
}

export function modifyText(node: Node, func: (input: string, i: string) => string, spareTags: string[] = [], seed = "") {
    if (node.nodeType === 3) {
        if (node.textContent && node.textContent.trim().length > 0) node.textContent = node.textContent && func(node.textContent, seed);
    } else if (node.nodeType === 1) {
        if (spareTags.includes((<Element>node).tagName.toLowerCase())) return;
        const children = node.childNodes;
        for (let i = children.length; i--;) modifyText(children[i], func, spareTags, seed + i);
    }
}