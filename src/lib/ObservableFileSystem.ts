import FileSystem, {FileSystemNode} from "./FileSystem.ts";
import FileSystemObserver, {ObserverCallback} from "./FileSystemObserver.ts";
import IndexedDB from "./IndexedDB.ts";

export default class ObservableFileSystem extends FileSystem {
    private observer: FileSystemObserver;

    constructor(db: IndexedDB) {
        super(db);
        this.observer = new FileSystemObserver();
    }

    async createNode(path: string, type: 'file' | 'folder') {
        await super.createNode(path, type);

        const node: FileSystemNode = type === 'file' ? { path, type } : {path, type, children: []};
        this.observer.notify(path.substring(0, path.lastIndexOf('/')) || '/', 'created', node);
    }

    async deleteNode(path: string) {
        await super.deleteNode(path);

        const node = await super.getNode(path)
        if (!node) return;

        this.observer.notify(path.substring(0, path.lastIndexOf('/')) || '/', 'deleted', node);
    }

    addObserver(directory: string, callback: ObserverCallback) {
        this.observer.addObserver(directory, callback);
    }

    removeObserver(directory: string, callback: ObserverCallback) {
        this.observer.removeObserver(directory, callback);
    }
}