/**
 * UUID based file indexer
 * Stores FILE_ENTRY, FILE_PATH as csv entries
 * Using CSV to reduce memory cost when updating to file
 *
 * @author Zhao Yun
 */
import fs from "fs";
import {basename, join} from "path";
import {CsvFormatterStream, CsvParserStream, format, parse} from 'fast-csv';
import EventEmitter from "events";
import {v4 as uuidv4} from 'uuid';
import {findLast} from "./utils"

const ROOT_DIR = "/data";

type FilePath = string;
type IndexUUID = string;
type IndexName = string;
type IndexPath = string;

type IndexRow = {
    uuid: IndexUUID;
    name: IndexName;
    path: IndexPath;
};

class IndexerStorage extends EventEmitter {
    readonly _readStream!: CsvParserStream<IndexRow, IndexRow>;
    readonly _writeStream!: CsvFormatterStream<IndexRow, IndexRow>;

    readonly INDEX_PATH: string;
    readonly FOLDER_DIR: string;

    _index: IndexRow[];
    readonly _indexName: string;

    constructor(folderDir: string, indexName = 'index.csv') {
        super();
        this._index = [];
        this._indexName = indexName;
        this.FOLDER_DIR = folderDir;
        this.INDEX_PATH = join(this.FOLDER_DIR, indexName);
        if (!fs.existsSync(this.FOLDER_DIR)) fs.mkdirSync(this.FOLDER_DIR);
        if (!fs.existsSync(this.INDEX_PATH)) fs.writeFileSync(this.INDEX_PATH, '');
        this._readStream = parse<IndexRow, IndexRow>({headers: false, ignoreEmpty: true});
        this._writeStream = format<IndexRow, IndexRow>({headers: false, includeEndRowDelimiter: true});
        fs.createReadStream(this.INDEX_PATH).pipe(this._readStream)
            .on('data', r => this._readIndex(r))
            .on('end', () => {
                const out = fs.createWriteStream(this.INDEX_PATH, {flags: "a"});
                out.write('\n'); // why, just why, fast-csv, do i have to do this to avoid line overlapping
                this._writeStream.pipe(out);
            });
    }

    read(path: string): fs.ReadStream | undefined {
        const loc = this._read(path);
        return loc && fs.existsSync(loc) && fs.createReadStream(loc) || undefined;
    }

    write(path: string): fs.WriteStream {
        return fs.createWriteStream(this._write(path));
    }

    /**
     * AB are paths, ab are uuids
     * A->a B->b
     *
     * Rename A to B
     * remove index A
     * A->a
     * B->b
     * A->nil
     * B->a
     *
     * @param oldPath
     * @param newPath
     */
    rename(oldPath: string, newPath: string) {
        let o = this._find(oldPath);
        if (!o) return;
        this.deleteIndex(oldPath);
        o.name = basename(o.path = newPath);
        this._writeIndex(o);
    }

    delete(path: string) {
        const loc = this._read(path);
        if (loc && fs.existsSync(loc)) {
            this.deleteIndex(path);
            return fs.unlinkSync(loc);
        }
    }

    deleteIndex(path: string) {
        this._writeIndex({name: 'delete', path: path, uuid: 'null'})
    }

    find(path: string): IndexRow[] {
        return this.query(r => r.path.startsWith(path) && fs.existsSync(this._file(r)));
    }

    deleteDir(path: string): Promise<void>[] {
        return this.find(path).map(r => fs.promises.unlink(this._file(r)))
    }

    _read(path: string): FilePath | undefined {
        if (path.endsWith('/')) throw new Error('path can not end with "/"');
        const row = this._find(path);
        if (row) return this._file(row);
        else return undefined;
    }

    _write(path: string): FilePath {
        if (path.endsWith('/')) throw new Error('path can not end with "/"');
        const row = this._find(path);
        if (row) return this._file(row);
        const newRow: IndexRow = {path: path, uuid: uuidv4(), name: basename(path)};
        this._writeIndex(newRow);
        return this._file(newRow);
    }

    _find(path: string) {
        let file = findLast(this._index, i => i.path === path); // new ones are more accurate
        if (file?.uuid !== 'null') return file;
    }

    query(func: (row: IndexRow, index: number) => boolean): IndexRow[] {
        return this._index.filter(func);
    }

    _writeIndex(row: IndexRow) {
        this._index.push(row);
        this._writeStream.write([row.uuid, row.path, row.name]);
    }

    _readIndex(row: string[3]) {
        this._index.push({
            uuid: row[0],
            path: row[1],
            name: row[2]
        });
    }

    _file(row: IndexRow): FilePath {
        return join(this.FOLDER_DIR, row.uuid);
    }

    async prune() {
        const files = (await fs.promises.readdir(this.FOLDER_DIR)).filter(f => f !== this._indexName); // uuid
        const mapping: { [path: string]: IndexUUID } = {};
        for (const row of this._index) mapping[row.path] = row.uuid;
        let exists = Object.entries(mapping).filter(s => {
            return s[1] !== 'null' && fs.existsSync(join(this.FOLDER_DIR, s[1])); // uuid not null and uuid file exist
        });
        let mappedFiles = exists.map(s => s[1]); // uuid
        const unmappedFiles = files.filter(p => !mappedFiles.includes(p)); // uuid
        unmappedFiles.forEach(f => fs.unlinkSync(join(this.FOLDER_DIR, f)));
        this._index = [];
        fs.writeFileSync(this.INDEX_PATH, '');
        exists.filter(e => !unmappedFiles.includes(e[0])).forEach(t => this._writeIndex({
            name: basename(t[0]),
            path: t[0],
            uuid: t[1]
        }));
    }

    clear() {
        return fs.promises.unlink(this.INDEX_PATH);
    }
}

const USERS_DIR = join(ROOT_DIR, 'users');
const NOTES_DIR = join(ROOT_DIR, 'notes');
const IMAGES_DIR = join(ROOT_DIR, 'images');
export const USERS_STORE = new IndexerStorage(USERS_DIR);
export const COLLECTION_NOTES_STORE = new IndexerStorage(NOTES_DIR);
export const COLLECTION_IMAGE_STORE = new IndexerStorage(IMAGES_DIR);