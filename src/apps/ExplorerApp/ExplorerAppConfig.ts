import {DefaultAppType} from "../defaultApps.ts";
import ExplorerApp from "./ExplorerApp.tsx";

const explorerAppConfig: DefaultAppType = {
    name: 'system.explorer',
    title: 'Проводник',
    width: 600,
    height: 400,
    content: ExplorerApp,
}

export default explorerAppConfig;