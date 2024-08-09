import DesktopSelection from "./DesktopSelection.tsx";

export default function DesktopMain() {
    let mainRef!: HTMLDivElement;

    return <main class={'flex-auto relative flex flex-col flex-wrap max-h-full'} ref={mainRef}>
        <DesktopSelection selectOnRef={mainRef}/>
    </main>
}