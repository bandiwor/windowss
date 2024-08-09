import viteLegacyPlugin from "@vitejs/plugin-legacy";
import {defineConfig} from 'vite'
import solid from 'vite-plugin-solid'
import solidSvg from "vite-plugin-solid-svg";


export default defineConfig({
    plugins: [
        solid(),
        solidSvg(),
        /*viteLegacyPlugin({
            targets: ['defaults', 'not IE 11'],
        })*/
    ],
    build: {
        minify: 'terser',
        cssMinify: 'lightningcss',
    }
})
