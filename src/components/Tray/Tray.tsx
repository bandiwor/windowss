import TrayApps from "./TrayApps.tsx";
import TrayClocks from "./TrayClocks.tsx";
import TrayMinimizeAllButton from "./TrayMinimizeAllButton.tsx";
import TrayWindowMenuButton from "./TrayWindowMenuButton.tsx";

export default function Tray() {
    return <aside
        class={'w-full h-[45px] z-50 text-tray-font bg-tray-background border-t border-white border-opacity-20 backdrop-blur mt-auto flex items-center justify-between'}>
        <div class={'h-full flex gap-1 items-center'}>
            <TrayWindowMenuButton/>
            <TrayApps/>
        </div>
        <div class={'h-full flex gap-1 items-center'}>
            <TrayClocks/>
            <TrayMinimizeAllButton/>
        </div>
    </aside>
}