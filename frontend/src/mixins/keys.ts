const codes: { [code: number]: string } = {
    65: "a",
    66: "b",
    67: "c",
    68: "d",
    69: "e",
    70: "f",
    71: "g",
    72: "h",
    73: "i",
    74: "j",
    75: "k",
    76: "l",
    77: "m",
    78: "n",
    79: "o",
    80: "p",
    81: "q",
    82: "r",
    83: "s",
    84: "t",
    85: "u",
    86: "v",
    87: "w",
    88: "x",
    89: "y",
    90: "z",
    32: " ",
    37: "←",
    38: "↑",
    39: "→",
    40: "↓",
    191: "/",
    13: "↩"
};

export default function generate(word: string, cb: () => void, once = false) {
    let match = word;
    const destroy = () => window.removeEventListener('keydown', handler);

    function handler({keyCode}: { keyCode: number }) {
        if (codes[keyCode] !== match.charAt(0)) match = word
        else if (!(match = match.slice(1))) {
            cb && cb();
            once && destroy();
            match = word;
        }
    }

    window.addEventListener('keydown', handler);
    return destroy;
}