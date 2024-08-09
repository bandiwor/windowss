import {DefaultAppType} from "../defaultApps.ts";
import NotepadApp from "./NotepadApp.tsx";

const notepadAppConfig: DefaultAppType = {
    name: 'system.notepad',
    content: NotepadApp,
    title: 'Notepad',
    width: 600,
    height: 450,
}

export default notepadAppConfig;