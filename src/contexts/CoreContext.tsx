import {createContext, createEffect, createSignal, JSX, onCleanup, onMount, useContext} from "solid-js";
import {accentColorStorageName, themeStorageName} from "../constants/storageNames.ts";

export type ThemeType = 'light' | 'dark' | 'auto';

export type CoreContextType = {
    wallpapersSrc: () => string;
    theme: () => ThemeType;
    accentColor: () => string;

    setTheme: (theme: ThemeType) => void;
    setAccentColor: (color: string) => void;
    setWallpapersSrc: (src: string) => void;
}

const CoreContext = createContext<CoreContextType>();

const matchMediaOnPrefersDark = matchMedia('(prefers-color-scheme: dark)');

const applyThemeWithMediaQuery = (evt: MediaQueryListEvent) => {
    document.documentElement.dataset.theme = evt.matches ? 'dark' : 'light';
}

export function CoreProvider(props: { children: JSX.Element }) {
    const [accentColor, setAccentColor] = createSignal<ReturnType<CoreContextType['accentColor']>>('#0978ec');
    const [wallpapersSrc, setWallpapersSrc] = createSignal('/wallpapers0.webp');
    const [theme, setTheme] = createSignal<ThemeType>('auto');

    const getThemeOnMount = () => {
        const storageTheme = localStorage.getItem(themeStorageName);
        if (!storageTheme) {
            return localStorage.setItem(themeStorageName, theme());
        }
        if (!(storageTheme === 'light' || storageTheme === 'dark' || storageTheme === 'auto')) {
            throw new Error(`<CoreContext>: Mount error: localStorage<${themeStorageName}> must be light, dark or auto, but eq "${storageTheme}"`);
        }
        setTheme(storageTheme);
    }
    const getAccentColorOnMount = () => {
        const storageAccent = localStorage.getItem(accentColorStorageName);
        if (!storageAccent) {
            return localStorage.setItem(accentColorStorageName, accentColor());
        }
        if (!storageAccent.startsWith('#') || storageAccent.length !== 7) {
            throw new Error(`<CoreContext>: Mount error: localStorage<${accentColorStorageName}> must be a hex color, but eq "${storageAccent}"`);
        }
        setAccentColor(storageAccent);
    }

    createEffect(() => {
        const enabledTheme = theme();
        document.documentElement.dataset.themeMode = enabledTheme;

        switch (enabledTheme) {
            case 'light':
                matchMediaOnPrefersDark.removeEventListener('change', applyThemeWithMediaQuery);
                document.documentElement.dataset.theme = 'light';
                break;
            case 'dark':
                matchMediaOnPrefersDark.removeEventListener('change', applyThemeWithMediaQuery);
                document.documentElement.dataset.theme = 'dark';
                break;
            case 'auto':
                document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                matchMediaOnPrefersDark.addEventListener('change', applyThemeWithMediaQuery);
                break;
        }
    })

    createEffect(() => {
        document.documentElement.style.setProperty('--accent-color', accentColor());
    })

    onCleanup(() => {
        matchMediaOnPrefersDark.removeEventListener('change', applyThemeWithMediaQuery);
    })

    onMount(() => {
        getThemeOnMount();
        getAccentColorOnMount();
    })

    const setWallpapersSrcFn: CoreContextType['setWallpapersSrc'] = (src) => {
        if (!(src.endsWith('.webp') || src.endsWith('.jpg') || src.endsWith('.png'))) {
            throw new Error('<CoreContext>: setWallpapersSrcFn(value). Value must be a URL to .webp or (.jpg or .png) file')
        }
        setWallpapersSrc(src);
    }

    const setThemeFn: CoreContextType['setTheme'] = (theme) => {
        if (!['light', 'dark', 'auto'].includes(theme.toLowerCase())) {
            throw new Error('<CoreContext>: setTheme(value). Value must be a "light", "dark" or "auto"')
        }
        setTheme(theme.toLowerCase() as ThemeType);
    }

    const setAccentColorFn: CoreContextType['setAccentColor'] = (value) => {
        if (!value.startsWith('#') || value.length !== 7) {
            throw new Error('<CoreContext>: setAccentColor(value). Value must be a HEX color. Ex: #34ff1c')
        }
        setAccentColor(value);
    }

    const contextValue: CoreContextType = {
        wallpapersSrc,
        theme,
        accentColor,
        setTheme: setThemeFn,
        setAccentColor: setAccentColorFn,
        setWallpapersSrc: setWallpapersSrcFn,
    }

    return <CoreContext.Provider value={contextValue}>
        {props.children}
    </CoreContext.Provider>
}

export function useCoreContext() {
    const context = useContext(CoreContext);
    if (!context) {
        throw new Error('useCoreContext() must be used within the <CoreContext>')
    }

    return context;
}
