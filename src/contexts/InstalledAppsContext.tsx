import {createContext, JSX, useContext} from "solid-js";
import defaultApps from "../apps/defaultApps.ts";
import {useWindowsContext} from "./WindowsContext.tsx";

export type InstalledAppsContextType = {
    startApp: (name: string, args?: Record<string, unknown>) => string | null;
    openFile: (path: string, args?: Record<string, unknown>) => string | null;
}

const InstalledAppsContext = createContext<InstalledAppsContextType>();

const extensionWithOpenProgramRatio: Record<string, string> = {
    'txt': 'system.notepad'
}

function getFileExtension(path: string) {
    const split = path.split('.');
    return split[split.length - 1];
}

export default function InstalledAppsProvider(props: { children: JSX.Element }) {
    const windowsContext = useWindowsContext();

    const startApp: InstalledAppsContextType['startApp'] = (name, args) => {
        const id = defaultApps.findIndex(app => app.name === name);

        if (id === -1) {
            return null;
        }

        const app = defaultApps[id];
        return windowsContext.addWindow(Object.assign(app, {
            args: args ?? {}
        }));
    }

    const openFile: InstalledAppsContextType['openFile'] = (path, args) => {
        const fileApp = extensionWithOpenProgramRatio[getFileExtension(path)];
        if (!fileApp) return null;

        return startApp(fileApp, Object.assign(args ?? {}, {
            filename: path,
        }))
    }

    const contextValue: InstalledAppsContextType = {
        startApp,
        openFile,
    }

    return <InstalledAppsContext.Provider value={contextValue}>
        {props.children}
    </InstalledAppsContext.Provider>
}

export function useInstalledAppsContext() {
    const context = useContext(InstalledAppsContext);
    if (!context) {
        throw new Error('useInstalledAppsContext() must be used within the <InstalledAppsProvider>');
    }
    return context;
}