import YAML from 'yaml';

export type ChoiceDef = { text: string, correct?: boolean };
export type QuizDef = { type?: 'mcq' | 'mrq' | 'text', Q: string, C?: ChoiceDef[], A?: string };

export function parseQuiz(yaml_source: string): QuizDef[] {
    const root = YAML.parse(yaml_source);
    if (!Array.isArray(root)) return [];
    return root.map(a => {
        const choices: ChoiceDef[] | undefined = a.C && Array.isArray(a.C) && a.C.map(parseChoice);
        return {
            type: a.type || (choices ?
                (choices.filter(e => e.correct).length > 1 ? 'mrq' : 'mcq') :
                a.A ? 'text' : undefined),
            Q: a.Q,
            A: a.A,
            C: choices
        };
    });
}

function parseChoice(line: string): ChoiceDef {
    line = String(line);
    if (line.startsWith("A:")) return {text: line.replace(/^A:\s*/, ''), correct: true};
    return {text: line};
}