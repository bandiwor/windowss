import {FileSystemNode} from "./FileSystem.ts";

export type ObserverCallback = (event: 'created' | 'deleted', path: FileSystemNode) => void;

export default class FileSystemObserver {
    private observers: Map<string, ObserverCallback[]> = new Map();

    addObserver(directory: string, callback: ObserverCallback) {
        if (!this.observers.has(directory)) {
            this.observers.set(directory, []);
        }
        this.observers.get(directory)?.push(callback);
    }

    removeObserver(directory: string, callback: ObserverCallback) {
        const observers = this.observers.get(directory);
        if (observers) {
            this.observers.set(directory, observers.filter(cb => cb !== callback));
        }
    }

    notify(directory: string, event: 'created' | 'deleted', node: FileSystemNode) {
        const observers = this.observers.get(directory) || [];
        for (const callback of observers) {
            callback(event, node);
        }
    }
}