import Desktop from "./components/Desktop/Desktop.tsx";
import {CoreProvider} from "./contexts/CoreContext.tsx";
import {FileSystemProvider} from "./contexts/FileSystemContext.tsx";
import InstalledAppsProvider from "./contexts/InstalledAppsContext.tsx";
import {WindowsProvider} from "./contexts/WindowsContext.tsx";

export default function App() {
    return <CoreProvider>
        <FileSystemProvider>
            <WindowsProvider>
                <InstalledAppsProvider>
                    <Desktop/>
                </InstalledAppsProvider>
            </WindowsProvider>
        </FileSystemProvider>
    </CoreProvider>
}