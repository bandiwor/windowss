import {createEffect, createSignal, For, Match, Switch} from "solid-js";
import {useFileSystemContext} from "../../contexts/FileSystemContext.tsx";
import {useInstalledAppsContext} from "../../contexts/InstalledAppsContext.tsx";
import {FileSvg, FolderSvg} from "../../icons/Icons.tsx";
import {FileSystemNode} from "../../lib/FileSystem.ts";
import {ObserverCallback} from "../../lib/FileSystemObserver.ts";

function getFilename(path: string): string {
    const parts = path.split("/");
    return parts[parts.length - 1];
}

export default function ExplorerApp() {
    const [cwd, setCwd] = createSignal('/');
    const [filesInCurrentDirectory, setFilesInCurrentDirectory] = createSignal<FileSystemNode[]>([]);
    const filesystemContext = useFileSystemContext();
    const installedAppsContext = useInstalledAppsContext()
    let lastDirectory = '';

    const getFilesInDirectory = async (directory: string) => {
        return filesystemContext.fileSystem.listDirectory(directory);
    }

    const onChangeFiles: ObserverCallback = (event, node) => {
        switch (event) {
            case "created":
                setFilesInCurrentDirectory(prev => [node, ...prev]);
                break;
            case "deleted":
                setFilesInCurrentDirectory(prev =>
                    prev.filter(file => file.path !== node.path))
        }
    }

    createEffect(() => {
        const directory = cwd();
        getFilesInDirectory(directory).then(files => {
            setFilesInCurrentDirectory(files);
        }).catch((err: unknown) => {
            console.error(err);
        })

        if (lastDirectory) {
            filesystemContext.fileSystem.removeObserver(lastDirectory, onChangeFiles);
        }
        filesystemContext.fileSystem.addObserver(directory, onChangeFiles);
        lastDirectory = cwd();
    })

    const handleCreateFolderClick = async () => {
        const folderName = prompt('Название папки');
        if (!folderName) {
            return;
        }

        const newFolderPath = cwd() === '/' ? '/' + folderName : cwd() + '/' + folderName;

        await filesystemContext.fileSystem.createNode(newFolderPath, 'folder');
    }

    const handleOpenFolderClick = (folderPath: string) => {
        setCwd(folderPath);
    }

    const handleGoBack = () => {
        const parts = cwd().split('/').filter(Boolean);
        const newParts = parts.slice(0, parts.length - 1);
        if (newParts.length === 0) {
            return setCwd('/');
        }
    }

    const handleOpenFileClick = (path: string) => {
        installedAppsContext.openFile(path);
    }

    return <div class={'flex flex-col gap-2 h-full'}>
        <nav class={'w-full flex gap-2'}>
            <button onClick={handleGoBack}
                    class={'px-2 py-1 rounded bg-neutral-900 text-white border border-neutral-600 hover:bg-neutral-800 active:bg-neutral-900'}>Назад
            </button>
            <input disabled
                   class={'w-full px-2 py-1 text-xl bg-neutral-900 rounded text-white border border-neutral-600'}
                   type={'text'} value={cwd()}/>
            <button onClick={handleCreateFolderClick}
                    class={'px-2 py-1 rounded bg-neutral-900 text-white border border-neutral-600 hover:bg-neutral-800 active:bg-neutral-900'}>Создать
                Папку
            </button>
        </nav>
        <div class={'grid grid-cols-4 gap-2 overflow-y-auto'}>
            <For each={filesInCurrentDirectory()}>
                {file => (
                    <Switch>
                        <Match when={file.type === 'file'}>
                            <button
                                onClick={[handleOpenFileClick, file.path]}
                                class={'bg-neutral-900 flex flex-col px-1 rounded-xl py-2 border border-neutral-800 hover:bg-neutral-800 active:border-neutral-700 transition-colors'}
                                title={`Открыть ${getFilename(file.path)}`}>
                                <span class={'visually-hidden'}>Открыть ${getFilename(file.path)}</span>
                                <FileSvg class={'stroke-accent stroke-2 w-8 self-center'}/>
                                <p class={'text-sm text-center self-center'}>{getFilename(file.path)}</p>
                            </button>
                        </Match>
                        <Match when={file.type === 'folder'}>
                            <button onClick={[handleOpenFolderClick, file.path]}
                                    class={'bg-neutral-900 flex flex-col px-1 rounded-xl py-2 border border-neutral-800 hover:bg-neutral-800 active:border-neutral-700 transition-colors'}
                                    title={`Зайти в ${getFilename(file.path)}`}>
                                <span class={'visually-hidden'}>Зайти в ${getFilename(file.path)}</span>
                                <FolderSvg class={'stroke-accent stroke-2 w-8 self-center'}/>
                                <p class={'text-sm text-center self-center'}>{getFilename(file.path)}</p>
                            </button>
                        </Match>
                    </Switch>
                )}
            </For>
        </div>
    </div>
}