import {useCoreContext} from "../../contexts/CoreContext.tsx";

export default function WallpapersBackground() {
    const coreContext = useCoreContext();

    return <img class={'fixed -z-50 object-cover h-full'} src={coreContext.wallpapersSrc()} alt="" width="100%"
                height="100%"/>
}