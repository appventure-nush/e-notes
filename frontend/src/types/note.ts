export interface Note {
    index: number;
    cid: string;
    nid: string;
    name: string;
    desc?: string;
    lastEditBy: string;
    lastEdit: number;
    url: string;
}