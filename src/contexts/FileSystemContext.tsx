import {createContext, createSignal, JSX, onMount, useContext} from "solid-js";
import IndexedDB from "../lib/IndexedDB.ts";
import ObservableFileSystem from "../lib/ObservableFileSystem.ts";

export type FileSystemContextType = {
    fileSystemInitialized: () => boolean,
    dbError: () => string | null,
    fileSystem: ObservableFileSystem
}

const FileSystemContext = createContext<FileSystemContextType>();
const indexedDB = new IndexedDB("appFilesystem");
const fileSystem = new ObservableFileSystem(indexedDB);

export function FileSystemProvider(props: { children: JSX.Element }) {
    const [fileSystemInitialized, setFileSystemInitialized] = createSignal(false);
    const [dbError, setDbError] = createSignal<string | null>(null);

    onMount(() => {
        indexedDB.init().then(() => {
            console.log('Indexed DB initialized successfully!');
            fileSystem.init().then(() => {
                console.log('File System initialized successfully!');
                setFileSystemInitialized(true);
            }).catch((reason) => {
                setDbError("Error while init new FileSystem().init()" + reason)
                throw new Error(dbError()?.toString());
            });
        }).catch((reason) => {
            setDbError("Error while init new IndexedDB().init()" + reason)
            throw new Error(dbError()?.toString());
        })
    })

    const contextValue: FileSystemContextType = {
        fileSystemInitialized,
        dbError,
        fileSystem
    }

    return <FileSystemContext.Provider value={contextValue}>
        {props.children}
    </FileSystemContext.Provider>;
}

export function useFileSystemContext() {
    const context = useContext(FileSystemContext);
    if (!context) {
        throw new Error('useFileSystemContext() must be used within the <CoreContext>');
    }
    return context;
}