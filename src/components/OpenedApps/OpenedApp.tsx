import {createEffect, createSignal, onCleanup} from "solid-js";
import {throttle} from "throttle-debounce";
import {useWindowsContext, WindowStateType} from "../../contexts/WindowsContext.tsx";
import {CloseSvg, RectangleSvg} from "../../icons/Icons.tsx";
import MinimizeSvg from "../../icons/MinimizeSvg.tsx";

export default function OpenedApp(props: Pick<WindowStateType, 'id'>) {
    const windowsContext = useWindowsContext();
    const currentWindow = windowsContext.getWindow(props.id);

    if (!currentWindow) {
        return null;
    }

    const [x, setX] = createSignal(currentWindow.x);
    const [y, setY] = createSignal(currentWindow.y);
    const [width, setWidth] = createSignal(currentWindow.width);
    const [height, setHeight] = createSignal(currentWindow.height);
    const [opacity, setOpacity] = createSignal(1);

    let appCoordsBeforeMaximize: [number, number, number, number] = [0, 0, 0, 0];
    let appResizeStartCoords: [number, number, number, number] = [0, 0, 0, 0];
    let appMoveStartCursorCoords: [number, number] = [0, 0];
    let appMoveStartAppCoords: [number, number] = [0, 0];

    createEffect(() => {
        updateWindowPositionInContext(x(), y());
    });
    createEffect(() => {
        updateWindowSizeInContext(width(), height());
    });

    const updateWindowPositionInContext = throttle(250, (x: number, y: number) => {
        windowsContext.setPosition(props.id, x, y);
    });
    const updateWindowSizeInContext = throttle(250, (w: number, h: number) => {
        windowsContext.setSize(props.id, w, h);
    });

    const handleMoveStart = (evt: MouseEvent) => {
        appMoveStartCursorCoords = [evt.clientX, evt.clientY];
        appMoveStartAppCoords = [x(), y()];
        windowsContext.makeTopMost(props.id);

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleMoveEnd);
    };

    const handleMove = throttle(5, (evt: MouseEvent) => {
        if (evt.clientX === 0 || evt.clientY === 0) {
            return;
        }
        const newX = Math.max(0, Math.min(window.innerWidth - width(), appMoveStartAppCoords[0] + (evt.clientX - appMoveStartCursorCoords[0])));
        const newY = Math.max(0, Math.min(window.innerHeight - height(), appMoveStartAppCoords[1] + (evt.clientY - appMoveStartCursorCoords[1])));
        setX(newX);
        setY(newY);
    });

    const handleMoveEnd = () => {
        updateWindowPositionInContext(x(), y()); // Обновляем позицию в контексте при завершении перемещения
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleMoveEnd);
    };

    const handleResizeStart = (evt: MouseEvent) => {
        appResizeStartCoords = [evt.clientX, evt.clientY, width(), height()];

        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', handleResizeEnd);
        document.body.addEventListener('mouseleave', handleResizeEnd);
    };

    const handleResize = throttle(5, (evt: MouseEvent) => {
        const newWidth = Math.min(Math.max(appResizeStartCoords[2] + (evt.clientX - appResizeStartCoords[0]), currentWindow.minWidth), currentWindow.maxWidth);
        const newHeight = Math.min(Math.max(appResizeStartCoords[3] + (evt.clientY - appResizeStartCoords[1]), currentWindow.minHeight), currentWindow.maxHeight);
        setWidth(newWidth);
        setHeight(newHeight);
    });

    const handleResizeEnd = () => {
        updateWindowSizeInContext(width(), height()); // Обновляем размер в контексте при завершении изменения размера
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.removeEventListener('mouseleave', handleResizeEnd);
    };

    const handleMinimize = () => {
        windowsContext.minimizeWindow(props.id)
    }

    const handleMaximize = () => {
        if (currentWindow.maximized) {
            setX(appCoordsBeforeMaximize[0]);
            setY(appCoordsBeforeMaximize[1]);
            setWidth(appCoordsBeforeMaximize[2]);
            setHeight(appCoordsBeforeMaximize[3]);
            windowsContext.restoreWindow(props.id);
        } else {
            appCoordsBeforeMaximize = [x(), y(), width(), height()];
            windowsContext.maximizeWindow(props.id);
        }
    }

    const handleClose = () => {
        windowsContext.removeWindow(props.id)
    }

    createEffect(() => {
        if (currentWindow.minimized) {
            const intervalId = setInterval(() => {
                setOpacity(prev => Math.max(0, prev - 0.2));
                if (opacity() <= 0) {
                    clearInterval(intervalId);
                }
            }, 10);
        } else if (opacity() <= 0) {
            const intervalId = setInterval(() => {
                setOpacity(prev => Math.min(1, prev + 0.2));
                if (opacity() >= 1) {
                    clearInterval(intervalId);
                }
            }, 10);
        }
    });

    createEffect(() => {
        if (currentWindow.maximized) {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
            setX(0);
            setY(0);
        }
    });

    onCleanup(() => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleMoveEnd);
        document.removeEventListener('mousedown', handleMoveStart);
        document.removeEventListener('mousemove', handleResizeStart);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.removeEventListener('mousedown', handleResize);
    });

    return (
        <article
            class={'absolute rounded bg-apps-background text-apps-font flex flex-col shadow-xl'}
            style={{
                top: y() + 'px',
                left: x() + 'px',
                width: width() + 'px',
                height: height() + 'px',
                opacity: opacity(),
                display: opacity() <= 0 ? 'none' : undefined,
                "z-index": currentWindow.layerNumber
            }}
        >
            <header class={'flex items-start justify-between bg-apps-header-background text-apps-font rounded-t'}>
                <div class={'flex items-center ml-1'}>
                    <img src={currentWindow.iconSrc} alt="Logo" class={'w-4 aspect-square object-contain'}/>
                    <h2 class={'ml-2 text-lg break-keep whitespace-nowrap'}>{currentWindow.title}</h2>
                </div>
                <div
                    class={'w-full h-6 flex-auto cursor-pointer mx-2 p-1 active:cursor-move'}
                    onMouseDown={handleMoveStart}
                ></div>
                <div class={'flex items-stretch mr-1'}>
                    <button
                        title={'Свернуть'}
                        class={'h-full py-0.5 px-1 rounded-bl border border-double border-neutral-700 cursor-default bg-apps-header-control-background hover:bg-apps-header-control-background-hover'}
                        onClick={handleMinimize}>
                        <MinimizeSvg class="w-4 fill-apps-font aspect-square translate-y-1.5"/>
                        <span class={'visually-hidden'}>Свернуть окно</span>
                    </button>
                    <button
                        title={'Развернуть'}
                        class={'h-full py-0.5 px-1 border border-double border-neutral-700 cursor-default  bg-apps-header-control-background hover:bg-apps-header-control-background-hover'}
                        onClick={handleMaximize}>
                        <RectangleSvg class={'w-4 aspect-square fill-apps-font'}/>
                        <span class={'visually-hidden'}>Развернуть окно</span>
                    </button>
                    <button
                        title={'Закрыть'}
                        class={'h-full py-0.5 px-1 bg-opacity-50 bg-red-500 rounded-br border border-double border-neutral-700 cursor-default hover:bg-opacity-80'}
                        onClick={handleClose}>
                        <CloseSvg class={'fill-apps-font w-4 aspect-square'}/>
                        <span class={'visually-hidden'}>Закрыть окно</span>
                    </button>
                </div>
            </header>
            <main class={'p-1 flex-auto'}>
                {currentWindow.content(props.id)}
            </main>
            <button onMouseDown={handleResizeStart} title={'Изменить размер'}
                    class={'absolute bottom-0 right-0 w-4 aspect-square rounded-br rounded-tl bg-transparent hover:bg-opacity-10 hover:bg-white cursor-nw-resize hover:w-5 active:w-7'}>
                <span class={'visually-hidden'}>Изменить размер окна</span>
            </button>
        </article>
    )
}
