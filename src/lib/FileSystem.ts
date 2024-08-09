import IndexedDB from "./IndexedDB.ts";

export interface FileSystemNode {
    path: string;
    type: 'file' | 'folder';
    children?: string[];
}

export default class FileSystem {
    private readonly root: FileSystemNode;

    constructor(private db: IndexedDB) {
        this.root = {path: '/', type: 'folder', children: []};
    }

    async init() {
        await this.db.init();
        const rootExists = await this.getNode('/');
        if (!rootExists) await this.saveNode(this.root);
    }

    async createNode(path: string, type: 'file' | 'folder') {
        const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';

        const parentNode = await this.getNode(parentPath);
        if (!parentNode || parentNode.type !== 'folder') throw new Error('Parent folder does not exist');

        const nodeExists = await this.nodeExists(path);
        if (nodeExists) throw new Error(`${type.charAt(0).toUpperCase() + type.slice(1)} already exists`);

        const node: FileSystemNode = {path, type, children: type === 'folder' ? [] : undefined};
        await this.saveNode(node);

        parentNode.children?.push(path);
        await this.saveNode(parentNode);
    }

    async nodeExists(path: string): Promise<boolean> {
        const node = await this.getNode(path);
        return !!node;
    }

    async renameNode(oldPath: string, newPath: string) {
        const node = await this.getNode(oldPath);
        if (!node) throw new Error('Node does not exist');

        await this.deleteNode(oldPath);
        node.path = newPath;
        await this.saveNode(node);
    }

    async deleteNode(path: string) {
        const node = await this.getNode(path);
        if (!node) throw new Error('Node does not exist');

        if (node.type === 'folder') {
            for (const child of node.children || []) {
                await this.deleteNode(child);
            }
        }

        const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
        const parentNode = await this.getNode(parentPath);

        if (parentNode) {
            parentNode.children = parentNode.children?.filter(child => child !== path);
            await this.saveNode(parentNode);
        }

        const transaction = this.db.getTransaction('fileSystem', 'readwrite');
        transaction.delete(path);

        if (node.type === 'file') {
            await this.deleteFileContent(path);
        }
    }

    async openFile(path: string): Promise<Blob | null> {
        const node = await this.getNode(path);
        if (!node || node.type !== 'file') throw new Error('File does not exist');
        return await this.readFileContent(path);
    }

    async writeFile(path: string, content: Blob) {
        const node = await this.getNode(path);
        if (!node) {
            if (!(path.startsWith('/') && path.length > 1)) {
                throw new Error('File path is invalid');
            }
            await this.createNode(path, 'file');
        } else if (node.type !== 'file') throw new Error('File does not exist');
        await this.saveFileContent(path, content);
    }

    async getNode(path: string): Promise<FileSystemNode | undefined> {
        return new Promise((resolve, reject) => {
            const transaction = this.db.getTransaction('fileSystem', 'readonly');
            const request = transaction.get(path);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveNode(node: FileSystemNode) {
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db.getTransaction('fileSystem', 'readwrite');
            const request = transaction.put(node);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async listDirectory(path: string): Promise<FileSystemNode[]> {
        const node = await this.getNode(path);
        if (!node || node.type !== 'folder') throw new Error('Directory does not exist');

        const children = node.children || [];
        const result: FileSystemNode[] = [];
        for (const childPath of children) {
            const childNode = await this.getNode(childPath);
            if (childNode) result.push(childNode);
        }
        return result;
    }

    private async saveFileContent(path: string, content: Blob) {
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db.getTransaction('fileContents', 'readwrite');
            const request = transaction.put({path, content});

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    private async readFileContent(path: string): Promise<Blob | null> {
        return new Promise((resolve, reject) => {
            const transaction = this.db.getTransaction('fileContents', 'readonly');
            const request = transaction.get(path);

            request.onsuccess = () => resolve(request.result?.content);
            request.onerror = () => reject(request.error);
        });
    }

    private async deleteFileContent(path: string) {
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db.getTransaction('fileContents', 'readwrite');
            const request = transaction.delete(path);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}