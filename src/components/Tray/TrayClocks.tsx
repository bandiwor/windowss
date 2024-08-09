import {createSignal, onCleanup, onMount} from "solid-js";

export default function TrayClocks() {
    const [time, setTime] = createSignal(new Date());
    let intervalId = 0;

    onMount(() => {
        intervalId = setInterval(() => {
            setTime(new Date());
        }, 200);
    })
    onCleanup(() => {
        clearInterval(intervalId);
    })

    return <button
        class={'h-full hover:bg-opacity-10 hover:bg-white flex flex-col gap-1 items-center text-xs p-0.5 pt-1 text-neutral-200'}>
        <p>{time().getHours().toString().padStart(2, '0')}:{time().getMinutes().toString().padStart(2, '0')}:{time().getSeconds().toString().padStart(2, '0')}</p>
        <p>{time().getDate().toString().padStart(2, '0')}.{(time().getMonth() + 1).toString().padStart(2, '0')}.{time().getFullYear()}</p>
    </button>
}