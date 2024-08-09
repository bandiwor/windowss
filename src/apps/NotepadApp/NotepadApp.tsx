import {createSignal, onMount} from "solid-js";
import {useFileSystemContext} from "../../contexts/FileSystemContext.tsx";
import {useWindowsContext} from "../../contexts/WindowsContext.tsx";

export default function NotepadApp(id: string) {
    const [filename, setFilename] = createSignal('');
    const [text, setText] = createSignal('');
    const fileSystemContext = useFileSystemContext();
    const windowsContext = useWindowsContext();
    const currentWindow = windowsContext.getWindow(id);
    if (!currentWindow) {
        return;
    }

    const openFile = async (filename: string) => {
        try {
            const data = await fileSystemContext.fileSystem.openFile(filename)
            if (!data) return;
            const fileContent = await new Response(data).text();
            setText(fileContent);
            setFilename(filename);
        } catch (e) {
            console.error(e);
        }
    }

    onMount(() => {
        const filename = currentWindow.args.filename;

        if (typeof filename === 'string') {
            void openFile(filename)
        }
    })

    const handleWrite = () => {
        fileSystemContext.fileSystem.writeFile(filename(), new Blob([text()])).catch(e => {
            alert(`Ошибка при записи в файл ${e}`);
        })
    }
    const handleRead = () => {
        fileSystemContext.fileSystem.openFile(filename()).then(content => {
            if (!content) return;
            new Response(content).text().then(text => {
                setText(text);
            })
        }).catch(e => {
            alert(`Ошибка при чтении из файла ${e}`)
        })
    }

    return <div class={'h-full w-full flex flex-col gap-1'}>
        <div class={'w-full flex items-center gap-1'}>
            <input
                type="text"
                class={'flex-auto bg-neutral-800 p-1 text-center rounded border border-neutral-500'}
                placeholder={'Путь к файлу'}
                value={filename()} onChange={e => setFilename(e.currentTarget.value)}
            />
            <button onClick={handleRead} type={'button'}
                    class={'flex-1 bg-neutral-800 p-1 rounded border border-neutral-500 hover:bg-neutral-700'}>
                Read
            </button>
            <button onClick={handleWrite} type={'button'}
                    class={'flex-1 bg-neutral-800 p-1 rounded border border-neutral-500 hover:bg-neutral-700'}>
                Write
            </button>
        </div>
        <textarea placeholder={'Начните писать...'}
                  class={'h-full w-full p-1 bg-neutral-800 text-white rounded border border-neutral-500 text-xl'}
                  value={text()} onChange={e => setText(e.currentTarget.value)}></textarea>
    </div>
}