import {For} from "solid-js";
import {useInstalledAppsContext} from "../../contexts/InstalledAppsContext.tsx";
import {useWindowsContext} from "../../contexts/WindowsContext.tsx";
import OpenedApp from "./OpenedApp.tsx";

export default function OpenedApps() {
    const windowsContext = useWindowsContext();
    const installedAppsContext = useInstalledAppsContext();

    return <div class={'text-apps-font'}>
        <button onClick={() => {
            installedAppsContext.startApp('system.test-app')
        }}>
            create test-app
        </button>
        <button onClick={() => {
            installedAppsContext.startApp('system.notepad', {
            })
        }}>
            create notepad
        </button>
        <button onClick={() => {
            installedAppsContext.startApp('system.explorer', {
            })
        }}>
            create explorer
        </button>



        <For each={windowsContext.windows}>
            {window => <OpenedApp id={window.id}/>}
        </For>
    </div>
}