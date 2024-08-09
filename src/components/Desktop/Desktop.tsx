import OpenedApps from "../OpenedApps/OpenedApps.tsx";
import Tray from "../Tray/Tray.tsx";
import WallpapersBackground from "../WallpapersBackground/WallpapersBackground.tsx";
import DesktopMain from "./DesktopMain.tsx";

export default function aDesktop() {
    return <div class={'max-w-[100vw] w-screen h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col relative select-none'}>
        <OpenedApps/>
        <WallpapersBackground/>
        <DesktopMain/>
        <Tray/>
    </div>
}