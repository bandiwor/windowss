import {DefaultAppType} from "../defaultApps.ts";
import TestApp from "./TestApp.tsx";

const testAppConfig: DefaultAppType = {
    name: "system.test-app",
    title: 'TestApp',
    content: TestApp,
    maxWidth: 600,
    minWidth: 400,
    width: 500,
    maxHeight: 500,
    minHeight: 300,
    height: 400,
    x: 300,
    y: 200,
}

export default testAppConfig;