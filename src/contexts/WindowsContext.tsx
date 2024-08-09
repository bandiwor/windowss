import {nanoid} from "nanoid";
import {createContext, createEffect, createSignal, JSX, useContext} from "solid-js";
import {createStore} from "solid-js/store";

export type WindowId = string;

export type WindowStateType = {
    id: WindowId;
    title: string;
    x: number;
    y: number;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    minimized: boolean;
    maximized: boolean;
    layerNumber: number;
    iconSrc: string;
    args: Record<string, unknown>;
    content: (id: WindowId) => JSX.Element;
}

export type CreateWindowType = Partial<Omit<WindowStateType, 'id' | 'layerNumber'>>;

export type WindowsContextType = {
    windows: WindowStateType[];
    layers: () => WindowId[];
    makeTopMost: (id: WindowId) => void;

    getWindowIndexById: (id: WindowId) => number;
    getWindow: (id: WindowId) => WindowStateType | undefined;

    addWindow: (config: CreateWindowType) => string;
    removeWindow: (id: WindowId) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    restoreWindow: (id: string) => void;
    setWindowTitle: (id: string, title: string) => void;
    setPosition: (id: string, x: number, y: number) => void;
    setSize: (id: string, width: number, height: number) => void;
}


const WindowsContext = createContext<WindowsContextType>();

export function WindowsProvider(props: { children: JSX.Element }) {
    const [windows, setWindows] = createStore<WindowsContextType['windows']>([]);
    const [layers, setLayers] = createSignal<ReturnType<WindowsContextType['layers']>>([]);

    createEffect(() => {
        layers().forEach((id, index, array) => {
            const windowIndex = getWindowIndexById(id);
            if (windowIndex !== -1) {
                setWindows(windowIndex, 'layerNumber', array.length - index);
            }
        });
    });

    const getWindowIndexById: WindowsContextType['getWindowIndexById'] = (id) => {
        return windows.findIndex(window => window.id === id);
    }

    const getWindow: WindowsContextType['getWindow'] = (id) => {
        return windows.find(window => window.id === id);
    }

    const makeTopMost: WindowsContextType['makeTopMost'] = (id) => {
        setLayers((currentLayers) => {
            const index = currentLayers.indexOf(id);
            if (index === -1 || index === 0) {
                return currentLayers;
            }
            return [id, ...currentLayers.slice(0, index), ...currentLayers.slice(index + 1)];
        });
    };

    const addWindow: WindowsContextType['addWindow'] = (config) => {
        const id = nanoid();
        setWindows(windows.length, {
            id,
            layerNumber: layers().length,
            width: config.width ?? 400,
            height: config.height ?? 300,
            title: config.title ?? 'My window',
            maximized: config.maximized ?? false,
            minimized: config.minimized ?? false,
            x: config.x ?? 100,
            y: config.y ?? 100,
            content: config.content,
            iconSrc: config.iconSrc ?? '/defaultWindowIcon.webp',
            minWidth: config.minWidth ?? 300,
            minHeight: config.minHeight ?? 200,
            maxHeight: config.maxHeight ?? Infinity,
            maxWidth: config.maxWidth ?? Infinity,
            args: config.args,
        });
        setLayers((currentLayers) => [id, ...currentLayers]);
        return id;
    };

    const removeWindow: WindowsContextType['removeWindow'] = (id) => {
        setWindows(windows => windows.filter(window => window.id !== id));
        setLayers((currentLayers) => currentLayers.filter(layerId => layerId !== id));
    };

    const minimizeWindow: WindowsContextType['minimizeWindow'] = (id) => {
        const index = getWindowIndexById(id);
        if (index !== -1) {
            setWindows(index, 'minimized', true);
            setWindows(index, 'maximized', false);
        }
    };

    const maximizeWindow: WindowsContextType['maximizeWindow'] = (id) => {
        const index = getWindowIndexById(id);
        if (index !== -1) {
            setWindows(index, 'maximized', true);
            setWindows(index, 'minimized', false);
        }
    };

    const restoreWindow: WindowsContextType['restoreWindow'] = (id) => {
        const index = getWindowIndexById(id);
        if (index !== -1) {
            setWindows(index, 'minimized', false);
            setWindows(index, 'maximized', false);
        }
    };

    const setWindowTitle: WindowsContextType['setWindowTitle'] = (id, title) => {
        const index = getWindowIndexById(id);
        if (index !== -1) {
            setWindows(index, 'title', title);
        }
    };

    const setPosition: WindowsContextType['setPosition'] = (id, x, y) => {
        const index = getWindowIndexById(id);
        if (index !== -1) {
            setWindows(index, {x, y});
        }
    };

    const setSize: WindowsContextType['setSize'] = (id, width, height) => {
        const index = getWindowIndexById(id);
        if (index !== -1) {
            setWindows(index, {width, height});
        }
    };

    const value: WindowsContextType = {
        windows,
        layers,
        makeTopMost,
        getWindowIndexById,
        getWindow,
        addWindow,
        maximizeWindow,
        minimizeWindow,
        removeWindow,
        restoreWindow,
        setPosition,
        setSize,
        setWindowTitle,
    }

    return <WindowsContext.Provider value={value}>
        {props.children}
    </WindowsContext.Provider>
}

export function useWindowsContext() {
    const context = useContext(WindowsContext);
    if (!context) {
        throw new Error('useWindowsContext() must be used within the <CoreContext>');
    }
    return context;
}
