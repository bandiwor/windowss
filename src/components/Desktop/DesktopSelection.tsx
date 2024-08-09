import {createSignal, onCleanup, onMount} from "solid-js";

export default function DesktopSelection(props: { selectOnRef: HTMLDivElement }) {
    const [selectStartX, setSelectStartX] = createSignal(0);
    const [selectStartY, setSelectStartY] = createSignal(0);
    const [selectX, setSelectX] = createSignal(0);
    const [selectY, setSelectY] = createSignal(0);
    const [selectWidth, setSelectWidth] = createSignal(0);
    const [selectHeight, setSelectHeight] = createSignal(0);

    const mouseMoveHandler = (evt: MouseEvent) => {
        const startX = selectStartX();
        const startY = selectStartY();
        const currentX = evt.clientX;
        const currentY = evt.clientY;

        const x = Math.min(startX, currentX);
        const y = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        setSelectX(x);
        setSelectY(y);
        setSelectWidth(width);
        setSelectHeight(height);
    }

    const mouseDownHandler = (evt: MouseEvent) => {
        setSelectStartX(evt.clientX);
        setSelectStartY(evt.clientY);
        setSelectX(evt.clientX);
        setSelectY(evt.clientY);
        setSelectWidth(0);
        setSelectHeight(0);
        document.body.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler); // Добавлен слушатель на документ
    }

    const mouseUpHandler = () => {
        document.body.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler); // Удален слушатель с документа
        setSelectStartX(0);
        setSelectStartY(0);
        setSelectX(0);
        setSelectY(0);
        setSelectWidth(0);
        setSelectHeight(0);
    }

    const mouseLeaveHandler = () => {
        document.body.removeEventListener('mousemove', mouseMoveHandler);
    }

    onMount(() => {
        props.selectOnRef.addEventListener('mousedown', mouseDownHandler);
        document.body.addEventListener('mouseleave', mouseLeaveHandler);
    })

    onCleanup(() => {
        props.selectOnRef.removeEventListener('mousedown', mouseDownHandler);
        props.selectOnRef.removeEventListener('mouseup', mouseUpHandler);
        document.body.removeEventListener('mouseleave', mouseLeaveHandler);
    })

    return (
        <div class={'fixed bg-blue-600 bg-opacity-50 border border-blue-600'} style={{
            left: selectX() + 'px',
            top: selectY() + 'px',
            width: selectWidth() + 'px',
            height: selectHeight() + 'px',
        }}>
        </div>
    );
}
