import {For} from "solid-js";
import {useWindowsContext, WindowStateType} from "../../contexts/WindowsContext.tsx";

export default function TrayApps() {
    const windowsContext = useWindowsContext();

    const handleAppIconClick = (window: WindowStateType) => {
        if (window.minimized) {
            windowsContext.restoreWindow(window.id);
        } else {
            windowsContext.minimizeWindow(window.id);
        }
    }

    return <ul class={'flex gap-0.5 text-tray-font h-full'}>
        <For each={windowsContext.windows}>
            {(window) =>
                <li class={'h-full aspect-square relative hover:bg-background-elevation-lg active:bg-background-elevation transition-colors duration-100'}
                    classList={{
                        'bg-background-elevation': !window.minimized
                    }}
                    title={window.title}
                >
                    <span class={'visually-hidden'}>Приложение {window.title}</span>
                    <button class={'w-full h-full p-2.5'} onClick={() => handleAppIconClick(window)}>
                        <img src={window.iconSrc} class={'m-auto h-auto w-full'} alt=""/>
                    </button>
                    <div class={'absolute w-full h-0.5 bg-accent bottom-0 left-0 right-0'}></div>
                </li>
            }
        </For>
    </ul>
}