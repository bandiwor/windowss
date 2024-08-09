import WindowsSvg from "../../icons/WindowsSvg.tsx";

export default function TrayWindowMenuButton() {
    return <button class={'h-full aspect-square p-3 fill-white hover:fill-accent hover:bg-white hover:bg-opacity-30 cursor-default'}>
        <span class={'visually-hidden'}>Open Windows Menu</span>
        <WindowsSvg class={'m-auto'}/>
    </button>
}