import {CreateWindowType} from "../contexts/WindowsContext.tsx";
import ExplorerAppConfig from "./ExplorerApp/ExplorerAppConfig.ts";
import NotepadAppConfig from "./NotepadApp/NotepadAppConfig.ts";
import TestAppConfig from "./TestApp/TestAppConfig.ts";

export type DefaultAppType = CreateWindowType & {
    name: string,
}

const defaultApps: DefaultAppType[] = [
    TestAppConfig,
    NotepadAppConfig,
    ExplorerAppConfig,
];

export default defaultApps;