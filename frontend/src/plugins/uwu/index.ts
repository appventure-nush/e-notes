import {getCapitalPercentage, InitModifierParam, isAt, isUri,} from "./utils";

import Seed from "./seed";

/**
 * Credits: https://github.com/Schotsl/Uwuifier-node
 * Taken directly due to incompatible build
 */
interface SpacesModifier {
    faces: number;
    actions: number;
    stutters: number;
}

const DEFAULTS = {
    SPACES: {faces: 0.05, actions: 0.075, stutters: 0.1},
    WORDS: 1,
    EXCLAMATIONS: 1,
};

export default class Uwuifier {
    public faces: string[] = [
        "(・`ω´・)",
        "(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄",
        "(/ω＼)",
        ";;w;;",
        "OwO",
        "UwU",
        ">w<",
        "^w^",
        "ÚwÚ",
        "^-^",
        ":3",
        "x3",
    ];
    public exclamations: string[] = ["!?", "?!!", "?!?1", "!!11", "?!?!"];
    public actions: string[] = [
        "*blushes*",
        "*whispers to self*",
        "*cries*",
        "*screams*",
        "*sweats*",
        "*twerks*",
        "*screeches*",
        "*sees bulge*",
        "*looks at you*",
        "*notices buldge*",
        "*starts twerking*",
        "*huggles tightly*",
        "*boops your nose*",
    ];
    public uwuMap = [
        [/[rl]/g, "w"],
        [/[RL]/g, "W"],
        [/n([aeiou])/g, "ny$1"],
        [/N([aeiou])/g, "Ny$1"],
        [/N([AEIOU])/g, "Ny$1"],
        [/ove/g, "uv"],
    ];

    @InitModifierParam()
    private _spacesModifier: SpacesModifier;
    @InitModifierParam()
    private _wordsModifier: number;
    @InitModifierParam()
    private _exclamationsModifier: number;

    constructor(
        {
            spaces = DEFAULTS.SPACES,
            words = DEFAULTS.WORDS,
            exclamations = DEFAULTS.EXCLAMATIONS,
        } = {
            spaces: DEFAULTS.SPACES,
            words: DEFAULTS.WORDS,
            exclamations: DEFAULTS.EXCLAMATIONS,
        },
    ) {
        this._spacesModifier = spaces ?? DEFAULTS.SPACES;
        this._wordsModifier = words ?? DEFAULTS.WORDS;
        this._exclamationsModifier = exclamations ?? DEFAULTS.EXCLAMATIONS;
    }

    public uwuifyWords(sentence: string, base = ""): string {
        const words = sentence.split(" ");

        return words.map((word) => {
            if (!word) return word;
            if (isAt(word)) return word;
            if (isUri(word)) return word;

            const seed = new Seed(word + base);

            for (const [oldWord, newWord] of this.uwuMap) {
                // Generate a random value for every map so words will be partly uwuified instead of not at all
                if (seed.random() > this._wordsModifier) continue;

                word = word.replace(oldWord, newWord as string);
            }

            return word;
        }).join(" ");
    }

    public uwuifySpaces(sentence: string, base = ""): string {
        const words = sentence.split(" ");

        const faceThreshold = this._spacesModifier.faces;
        const actionThreshold = this._spacesModifier.actions + faceThreshold;
        const stutterThreshold = this._spacesModifier.stutters + actionThreshold;

        return words.map((word, index) => {
            if (!word) return word;
            const seed = new Seed(word + base);
            const random = seed.random();

            const [firstCharacter] = word;

            if (random <= faceThreshold && this.faces) {
                // Add random face before the word
                word += " " + this.faces[seed.randomInt(0, this.faces.length - 1)];
                checkCapital();
            } else if (random <= actionThreshold && this.actions) {
                // Add random action before the word
                word += " " + this.actions[seed.randomInt(0, this.actions.length - 1)];
                checkCapital();
            } else if (random <= stutterThreshold && !isUri(word)) {
                // Add stutter with a length between 0 and 2
                const stutter = seed.randomInt(0, 2);
                return (firstCharacter + "-").repeat(stutter) + word;
            }

            function checkCapital() {
                // Check if we should remove the first capital letter
                if (firstCharacter !== firstCharacter.toUpperCase()) return;
                // if word has higher than 50% upper case
                if (getCapitalPercentage(word) > 0.5) return;

                // If it's the first word
                if (index === 0) {
                    // Remove the first capital letter
                    word = firstCharacter.toLowerCase() + word.slice(1);
                } else {
                    const previousWord = words[index - 1];
                    const previousWordLastChar = previousWord[previousWord.length - 1];
                    const prevWordEndsWithPunctuation = new RegExp("[.!?\\-]").test(
                        previousWordLastChar,
                    );

                    if (!prevWordEndsWithPunctuation) return;
                    word = firstCharacter.toLowerCase() + word.slice(1);
                }
            }

            return word;
        }).join(" ");
    }

    public uwuifyExclamations(sentence: string, base = ""): string {
        const words = sentence.split(" ");
        const pattern = new RegExp("[?!]+$");

        return words.map((word) => {
            if (!word) return word;
            const seed = new Seed(word + base);

            // If there are no exclamations return
            if (
                !pattern.test(word) || seed.random() > this._exclamationsModifier
            ) {
                return word;
            }

            word = word.replace(pattern, "");
            word +=
                this.exclamations[seed.randomInt(0, this.exclamations.length - 1)];

            return word;
        }).join(" ");
    }

    public uwuifySentence(sentence: string, base = ""): string {
        if (!sentence) return sentence;
        let uwuifiedString = sentence;

        uwuifiedString = this.uwuifyWords(uwuifiedString, base);
        uwuifiedString = this.uwuifyExclamations(uwuifiedString, base);
        uwuifiedString = this.uwuifySpaces(uwuifiedString, base);

        return uwuifiedString;
    }
}