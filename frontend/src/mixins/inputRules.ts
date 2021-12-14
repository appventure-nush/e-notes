export const INPUT_ID_RULES = [
    (v: string) => !!v || 'ID is required',
    (v: string) => (encodeURIComponent(v) === v) || 'ID has to be url-safe',
];

export const INPUT_NAME_RULES = [
    (v: string) => !!v || 'Name is required'
]