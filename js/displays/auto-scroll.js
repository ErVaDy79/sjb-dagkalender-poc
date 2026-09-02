import { getRequiredElement } from "../dom.js";
import { calculateCalendarColumns } from "../calendar-columns.js";
import {
    createCalendarElements,
    renderError,
    renderLoading
} from "../calendar-renderer.js";
import {
    findContentScale,
    setContentScale
} from "../scaling.js";


let activeScrollLifecycle = null;


export function getAutoScrollElements() {
    return {
        page: getRequiredElement("calendar-page", "auto-scroll"),
        statusContainer: getRequiredElement(
            "calendar-status",
            "auto-scroll"
        ),
        viewport: getRequiredElement("scroll-viewport", "auto-scroll"),
        content: getRequiredElement("scroll-content", "auto-scroll"),
        dateContainer: getRequiredElement(
            "calendar-date",
            "auto-scroll"
        ),
        blocksContainer: getRequiredElement(
            "calendar-blocks",
            "auto-scroll"
        )
    };
}


export function showAutoScrollLoading(elements) {
    elements.page.dataset.pageState = "loading";
    return renderLoading(elements.statusContainer);
}


export function showAutoScrollError(elements, error) {
    elements.page.dataset.pageState = "error";
    return renderError(elements.statusContainer, error);
}


export function renderAutoScrollCalendar(calendar, elements) {
    elements.page.dataset.pageState = "ready";
    setContentScale(elements.content, 1);

    const calendarElements = createCalendarElements(calendar);

    elements.dateContainer.replaceChildren();

    if (calendarElements.dateElement !== null) {
        elements.dateContainer.append(calendarElements.dateElement);
    }

    elements.blocksContainer.replaceChildren(
        calendarElements.announcementsElement,
        ...calendarElements.scheduleElements
    );
    elements.viewport.scrollTop = 0;

    return calendarElements;
}


export function refreshAutoScrollLayout(calendarElements, elements) {
    setContentScale(elements.content, 1);

    const columnLayout = calculateCalendarColumns(calendarElements);
    const scale = findContentScale(
        elements.content,
        elements.viewport,
        {
            constraints: {
                height: false
            }
        }
    );

    setContentScale(elements.content, scale);

    return {
        columnLayout,
        scale
    };
}


export function waitForScrollDelay(
    seconds,
    signal = null,
    {
        setTimer = setTimeout,
        clearTimer = clearTimeout
    } = {}
) {
    if (signal?.aborted) {
        return Promise.resolve(false);
    }

    const durationMilliseconds = Math.max(0, seconds * 1000);

    if (durationMilliseconds === 0) {
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        let settled = false;
        let timerId = null;

        const finish = (completed) => {
            if (settled) {
                return;
            }

            settled = true;
            signal?.removeEventListener("abort", handleAbort);
            resolve(completed);
        };
        const handleAbort = () => {
            clearTimer(timerId);
            finish(false);
        };

        signal?.addEventListener("abort", handleAbort, { once: true });
        timerId = setTimer(() => finish(true), durationMilliseconds);
    });
}


export function animateScrollTo(
    viewport,
    targetOffset,
    speedPixelsPerSecond,
    signal = null,
    {
        requestFrame = requestAnimationFrame,
        cancelFrame = cancelAnimationFrame,
        now = () => performance.now()
    } = {}
) {
    if (
        signal?.aborted
        || !Number.isFinite(speedPixelsPerSecond)
        || speedPixelsPerSecond <= 0
    ) {
        return Promise.resolve(false);
    }

    const maximumOffset = Math.max(
        0,
        viewport.scrollHeight - viewport.clientHeight
    );
    const destination = Math.min(
        maximumOffset,
        Math.max(0, targetOffset)
    );
    const startOffset = viewport.scrollTop;
    const distance = destination - startOffset;

    if (distance === 0) {
        return Promise.resolve(true);
    }

    const durationMilliseconds = (
        Math.abs(distance)
        / speedPixelsPerSecond
        * 1000
    );
    const startTime = now();

    return new Promise((resolve) => {
        let settled = false;
        let frameId = null;

        const finish = (completed) => {
            if (settled) {
                return;
            }

            settled = true;
            signal?.removeEventListener("abort", handleAbort);
            resolve(completed);
        };
        const handleAbort = () => {
            if (frameId !== null) {
                cancelFrame(frameId);
            }

            finish(false);
        };
        const step = (timestamp) => {
            frameId = null;

            const elapsed = Math.max(0, timestamp - startTime);
            const progress = Math.min(
                1,
                elapsed / durationMilliseconds
            );

            viewport.scrollTop = startOffset + distance * progress;

            if (progress === 1) {
                viewport.scrollTop = destination;
                finish(true);
                return;
            }

            frameId = requestFrame(step);
        };

        signal?.addEventListener("abort", handleAbort, { once: true });
        frameId = requestFrame(step);
    });
}


export async function runAutoScrollCycle(
    viewport,
    options,
    signal,
    {
        wait = waitForScrollDelay,
        animate = animateScrollTo
    } = {}
) {
    if (signal.aborted) {
        return false;
    }

    viewport.scrollTop = 0;

    const initialMaximumOffset = Math.max(
        0,
        viewport.scrollHeight - viewport.clientHeight
    );

    if (initialMaximumOffset === 0) {
        return true;
    }

    while (!signal.aborted) {
        const topWaitCompleted = await wait(
            options.topPauseSeconds,
            signal
        );

        if (!topWaitCompleted) {
            return false;
        }

        const maximumOffset = Math.max(
            0,
            viewport.scrollHeight - viewport.clientHeight
        );
        const downwardScrollCompleted = await animate(
            viewport,
            maximumOffset,
            options.speedPixelsPerSecond,
            signal
        );

        if (!downwardScrollCompleted) {
            return false;
        }

        const bottomWaitCompleted = await wait(
            options.bottomPauseSeconds,
            signal
        );

        if (!bottomWaitCompleted) {
            return false;
        }

        const upwardScrollCompleted = await animate(
            viewport,
            0,
            options.speedPixelsPerSecond,
            signal
        );

        if (!upwardScrollCompleted) {
            return false;
        }
    }

    return false;
}


export function stopAutoScroll() {
    if (activeScrollLifecycle === null) {
        return false;
    }

    const lifecycle = activeScrollLifecycle;

    activeScrollLifecycle = null;
    lifecycle.controller.abort();

    return true;
}


export function startAutoScroll(
    viewport,
    options,
    {
        createController = () => new AbortController(),
        runCycle = runAutoScrollCycle
    } = {}
) {
    stopAutoScroll();

    const controller = createController();
    const lifecycle = {
        controller,
        completion: null
    };

    activeScrollLifecycle = lifecycle;
    lifecycle.completion = Promise.resolve().then(
        () => runCycle(viewport, options, controller.signal)
    );

    const clearLifecycle = () => {
        if (activeScrollLifecycle === lifecycle) {
            activeScrollLifecycle = null;
        }
    };

    lifecycle.completion.then(clearLifecycle, clearLifecycle);

    return lifecycle;
}


export function initializeAutoScrollResizeHandling(
    elements,
    refreshLayoutAndScrolling,
    {
        windowObject = window,
        ResizeObserverClass = ResizeObserver,
        requestFrame = requestAnimationFrame,
        cancelFrame = cancelAnimationFrame,
        stopScrolling = stopAutoScroll
    } = {}
) {
    let resizeFrame = null;
    let disposed = false;

    const runRefresh = () => {
        resizeFrame = null;

        if (!disposed) {
            refreshLayoutAndScrolling();
        }
    };
    const scheduleRefresh = () => {
        if (disposed) {
            return;
        }

        stopScrolling();

        if (resizeFrame !== null) {
            cancelFrame(resizeFrame);
        }

        resizeFrame = requestFrame(runRefresh);
    };
    const resizeObserver = new ResizeObserverClass(scheduleRefresh);

    windowObject.addEventListener("resize", scheduleRefresh);
    resizeObserver.observe(elements.viewport);

    return {
        resizeObserver,
        scheduleRefresh,
        dispose() {
            if (disposed) {
                return false;
            }

            disposed = true;

            if (resizeFrame !== null) {
                cancelFrame(resizeFrame);
                resizeFrame = null;
            }

            windowObject.removeEventListener("resize", scheduleRefresh);
            resizeObserver.disconnect();
            stopScrolling();

            return true;
        }
    };
}
