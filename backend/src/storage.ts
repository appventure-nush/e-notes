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

const ROOT_DIR = "/data";

type FilePath = string;
type IndexUUID = string;
type IndexName = string;
type IndexPath = string;

type IndexRow = {
    uuid: IndexUUID;
    name: IndexName;
    path: IndexPath;
}

class IndexerStorage extends EventEmitter {
    readonly _readStream!: CsvParserStream<IndexRow, IndexRow>;
    readonly _writeStream!: CsvFormatterStream<IndexRow, IndexRow>;

    readonly INDEX_PATH: string;
    readonly FOLDER_DIR: string;

    _index: IndexRow[];

    constructor(folderDir: string, indexName = 'index.csv') {
        super();
        this._index = [];
        this.FOLDER_DIR = folderDir;
        this.INDEX_PATH = join(this.FOLDER_DIR, indexName);
        if (!fs.existsSync(this.FOLDER_DIR)) fs.mkdirSync(this.FOLDER_DIR);
        if (!fs.existsSync(this.INDEX_PATH)) fs.writeFileSync(this.INDEX_PATH, '');
        this._readStream = parse<IndexRow, IndexRow>({headers: false, ignoreEmpty: true});
        this._writeStream = format<IndexRow, IndexRow>({headers: false, includeEndRowDelimiter: true});
        fs.createReadStream(this.INDEX_PATH).pipe(this._readStream).on('data', r => this._readIndex(r)).on('end', () => {
            this.emit('loaded');
            this._writeStream.pipe(fs.createWriteStream(this.INDEX_PATH, {flags: "a"}));
        });
    }

    read(path: string): fs.ReadStream | undefined {
        const loc = this._read(path);
        return loc && fs.existsSync(loc) && fs.createReadStream(loc) || undefined;
    }

    write(path: string): fs.WriteStream {
        return fs.createWriteStream(this._write(path));
    }

    delete(path: string): Promise<void> | undefined {
        const loc = this._read(path);
        if (loc && fs.existsSync(loc)) return fs.promises.unlink(loc);
    }

    find(path: string): IndexRow[] {
        return this.query(r => r.path.startsWith(path) && fs.existsSync(this._file(r)));
    }

    deleteDir(path: string): Promise<void>[] {
        return this.find(path).map(r => fs.promises.unlink(this._file(r)))
    }

    _read(path: string): FilePath | undefined {
        if (path.endsWith('/')) throw new Error('path can not end with "/"');
        const row = this._index.find(i => i.path === path);
        if (row) return this._file(row);
        else return undefined;
    }

    _write(path: string): FilePath {
        if (path.endsWith('/')) throw new Error('path can not end with "/"');
        const row = this._index.find(i => i.path === path);
        if (row) return this._file(row);
        const newRow: IndexRow = {path: path, uuid: uuidv4(), name: basename(path)};
        this._writeIndex(newRow);
        return this._file(newRow);
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