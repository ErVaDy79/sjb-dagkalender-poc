export async function waitForInitialLayout(
    {
        fontsReady = document.fonts?.ready ?? Promise.resolve(),
        requestFrame = requestAnimationFrame
    } = {}
) {
    await fontsReady;
    await new Promise((resolve) => requestFrame(resolve));
}
