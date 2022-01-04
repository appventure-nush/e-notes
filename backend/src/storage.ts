/**
 * UUID based file indexer
 * Stores FILE_ENTRY, FILE_PATH as csv entries
 * Using CSV to reduce memory cost when updating to file
 *
 * @author Zhao Yun
 */
import fs from "fs";
import {basename, join} from "path";
import * as csv from 'fast-csv';
import EventEmitter from "events";
import {v4 as uuidv4} from 'uuid';

const ROOT_DIR = "/data";

type IndexRow = {
    name: string;
    path: string;
    uuid: string;
}

class IndexerStorage extends EventEmitter {
    readonly _readStream!: csv.CsvParserStream<IndexRow, IndexRow>;
    readonly _writeStream!: csv.CsvFormatterStream<IndexRow, IndexRow>;

    readonly INDEX_PATH: string;
    readonly FOLDER_DIR: string;

    _index: IndexRow[];

    constructor(indexPath: string, folderDir: string) {
        super();
        this._index = [];
        this.INDEX_PATH = indexPath;
        this.FOLDER_DIR = folderDir;
        if (!fs.existsSync(this.FOLDER_DIR)) fs.mkdirSync(this.FOLDER_DIR);
        if (!fs.existsSync(this.INDEX_PATH)) fs.writeFileSync(this.INDEX_PATH, '');
        this._readStream = csv.parse<IndexRow, IndexRow>({headers: true});
        this._writeStream = csv.format<IndexRow, IndexRow>({headers: true});
        fs.createReadStream(indexPath).pipe(this._readStream).on('data', r => this._readHandler(r)).on('end', () => {
            this.emit('loaded');
            this._writeStream.pipe(fs.createWriteStream(indexPath, {flags: "a"}));
        });
    }

    read(path: string): fs.ReadStream | undefined {
        const loc = this._findRealPath(path);
        return loc && fs.existsSync(loc) && fs.createReadStream(loc) || undefined;
    }

    write(path: string) {
        return fs.createWriteStream(this._newRow(path));
    }

    delete(path: string): Promise<void> | undefined {
        const loc = this._findRealPath(path);
        if (loc && fs.existsSync(loc)) return fs.promises.unlink(loc);
    }

    find(path: string): IndexRow[] {
        return this.query(r => r.path.startsWith(path) && fs.existsSync(this._getRealPath(r)));
    }

    deleteDir(path: string) {
        return this.find(path).map(r => fs.promises.unlink(this._getRealPath(r)))
    }

    _findRealPath(path: string): string | undefined {
        if (path.endsWith('/')) throw new Error('path can not end with "/"');
        const row = this._index.find(i => i.path === path);
        if (row) return this._getRealPath(row);
        else return undefined;
    }

    _newRow(path: string): string {
        if (path.endsWith('/')) throw new Error('path can not end with "/"');
        const row = this._index.find(i => i.path === path);
        if (row) return this._getRealPath(row);
        const newRow: IndexRow = {path: path, uuid: uuidv4(), name: basename(path)};
        this._insertRow(newRow);
        return this._getRealPath(newRow);
    }

    query(func: (row: IndexRow, index: number) => boolean): IndexRow[] {
        return this._index.filter(func);
    }

    _insertRow(row: IndexRow) {
        this._index.push(row);
        this._writeStream.write(row);
    }

    _readHandler(row: IndexRow) {
        this._index.push(row);
    }

    _getRealPath(row: IndexRow) {
        return join(this.FOLDER_DIR, row.uuid);
    }
}

const USERS_DIR = join(ROOT_DIR, 'users');
const NOTES_DIR = join(ROOT_DIR, 'notes');
const IMAGES_DIR = join(ROOT_DIR, 'images');
export const USERS_STORE = new IndexerStorage(join(USERS_DIR, 'index.csv'), USERS_DIR);
export const COLLECTION_NOTES_STORE = new IndexerStorage(join(NOTES_DIR, 'index.csv'), NOTES_DIR);
export const COLLECTION_IMAGE_STORE = new IndexerStorage(join(IMAGES_DIR, 'index.csv'), IMAGES_DIR);