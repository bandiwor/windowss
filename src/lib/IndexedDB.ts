export default class IndexedDB {
    private db: IDBDatabase | null = null;

    constructor(private readonly dbName: string) {
    }

    async init() {
        return new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;
                db.createObjectStore('fileSystem', {keyPath: 'path'});
                db.createObjectStore('fileContents', {keyPath: 'path'});
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onerror = () => reject(request.error);
        });
    }

    getTransaction(storeName: string, mode: IDBTransactionMode) {
        if (!this.db) throw new Error('Database not initialized');
        return this.db.transaction(storeName, mode).objectStore(storeName);
    }
}
