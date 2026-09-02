import { calculateCalendarColumns } from "../calendar-columns.js";
import {
    createCalendarElements,
    renderError,
    renderLoading
} from "../calendar-renderer.js";
import { getRequiredElement } from "../dom.js";
import {
    contentFits,
    findContentScale,
    getContainerSize,
    getContentSize,
    setContentScale
} from "../scaling.js";


let activeSlideshowLifecycle = null;


export function getSlideshowElements() {
    return {
        page: getRequiredElement("calendar-page", "slideshow"),
        statusContainer: getRequiredElement(
            "calendar-status",
            "slideshow"
        ),
        dateContainer: getRequiredElement(
            "calendar-date",
            "slideshow"
        ),
        viewport: getRequiredElement("slide-viewport", "slideshow"),
        content: getRequiredElement("slide-content", "slideshow"),
        slidesContainer: getRequiredElement(
            "calendar-slides",
            "slideshow"
        )
    };
}


export function showSlideshowLoading(elements) {
    elements.page.dataset.pageState = "loading";
    return renderLoading(elements.statusContainer);
}


export function showSlideshowError(elements, error) {
    elements.page.dataset.pageState = "error";
    return renderError(elements.statusContainer, error);
}


function getCalendarBlocks(calendarElements) {
    return [
        calendarElements.announcementsElement,
        ...calendarElements.scheduleElements
    ];
}


function createSlideElement(blocks, index) {
    const slide = document.createElement("div");

    slide.classList.add("slideshow-slide");
    slide.dataset.slideIndex = String(index);
    slide.append(...blocks);

    return slide;
}


export function createSlides(calendarElements) {
    return getCalendarBlocks(calendarElements).map(
        (block, index) => createSlideElement([block], index)
    );
}


export function showSlide(slides, index) {
    if (slides.length === 0) {
        return null;
    }

    const normalizedIndex = (
        (Number.isInteger(index) ? index : 0) % slides.length
        + slides.length
    ) % slides.length;

    slides.forEach((slide, slideIndex) => {
        slide.hidden = slideIndex !== normalizedIndex;
    });

    return normalizedIndex;
}


export function renderSlideshowCalendar(calendar, elements) {
    elements.page.dataset.pageState = "ready";
    setContentScale(elements.content, 1);

    const calendarElements = createCalendarElements(calendar);
    const slides = createSlides(calendarElements);

    elements.dateContainer.replaceChildren();

    if (calendarElements.dateElement !== null) {
        elements.dateContainer.append(calendarElements.dateElement);
    }

    elements.slidesContainer.replaceChildren(...slides);

    return {
        ...calendarElements,
        slides,
        activeSlideIndex: showSlide(slides, 0)
    };
}


export function groupConsecutiveBlocks(blocks, fitsTogether) {
    const groups = [];

    for (const block of blocks) {
        const currentGroup = groups.at(-1);

        if (
            currentGroup === undefined
            || !fitsTogether([...currentGroup, block])
        ) {
            groups.push([block]);
        } else {
            currentGroup.push(block);
        }
    }

    return groups;
}


export function getSlideContentHeight(
    slide,
    {
        getBlockRect = (block) => block.getBoundingClientRect(),
        getBlockSize = getContentSize
    } = {}
) {
    const blocks = [...slide.children];

    if (blocks.length === 0) {
        return 0;
    }

    let contentTop = Number.POSITIVE_INFINITY;
    let contentBottom = Number.NEGATIVE_INFINITY;

    for (const block of blocks) {
        const rect = getBlockRect(block);
        const size = getBlockSize(block);

        contentTop = Math.min(contentTop, rect.top);
        contentBottom = Math.max(
            contentBottom,
            rect.top + size.height
        );
    }

    return Math.max(0, contentBottom - contentTop);
}


export function mergeFittingSlides(
    calendarElements,
    elements,
    {
        createSlide = createSlideElement,
        getAvailableSize = getContainerSize,
        getRenderedHeight = getSlideContentHeight,
        fits = contentFits
    } = {}
) {
    const blocks = getCalendarBlocks(calendarElements);
    const availableSize = getAvailableSize(elements.viewport);
    const groups = groupConsecutiveBlocks(
        blocks,
        (candidateBlocks) => {
            const candidateSlide = createSlide(candidateBlocks, 0);

            elements.slidesContainer.replaceChildren(candidateSlide);

            return fits(
                {
                    width: 0,
                    height: getRenderedHeight(candidateSlide)
                },
                availableSize,
                {
                    width: false,
                    height: true
                }
            );
        }
    );
    const slides = groups.map(
        (group, index) => createSlide(group, index)
    );

    elements.slidesContainer.replaceChildren(...slides);

    return {
        groups,
        slides
    };
}


export function refreshSlideshowLayout(
    calendarElements,
    elements,
    activeSlideIndex,
    {
        calculateColumns = calculateCalendarColumns,
        createIndividualSlides = createSlides,
        findScale = findContentScale,
        mergeSlides = mergeFittingSlides
    } = {}
) {
    const slides = calendarElements.slides;
    const normalizedPriorIndex = slides.length === 0
        ? null
        : (
            (Number.isInteger(activeSlideIndex) ? activeSlideIndex : 0)
            % slides.length
            + slides.length
        ) % slides.length;
    const activeBlock = normalizedPriorIndex === null
        ? null
        : slides[normalizedPriorIndex].firstElementChild;
    const individualSlides = createIndividualSlides(calendarElements);

    elements.slidesContainer.replaceChildren(...individualSlides);
    slides.splice(0, slides.length, ...individualSlides);

    setContentScale(elements.content, 1);

    for (const slide of slides) {
        slide.hidden = false;
    }

    const columnLayout = calculateColumns(calendarElements);
    const slideScales = slides.map((_, index) => {
        showSlide(slides, index);
        setContentScale(elements.content, 1);
        return findScale(elements.content, elements.viewport);
    });
    const scale = slideScales.length === 0
        ? 1
        : Math.min(...slideScales);

    setContentScale(elements.content, scale);
    const mergedLayout = mergeSlides(
        calendarElements,
        elements
    );

    slides.splice(0, slides.length, ...mergedLayout.slides);

    const retainedSlideIndex = activeBlock === null
        ? 0
        : mergedLayout.groups.findIndex(
            (group) => group.includes(activeBlock)
        );
    const normalizedActiveIndex = showSlide(
        slides,
        retainedSlideIndex === -1 ? 0 : retainedSlideIndex
    );

    return {
        columnLayout,
        slideScales,
        scale,
        groups: mergedLayout.groups,
        activeSlideIndex: normalizedActiveIndex
    };
}


export function waitForSlideDuration(
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


export async function runSlideshowLoop(
    slides,
    options,
    signal,
    {
        displaySlide = showSlide,
        initialSlideIndex = 0,
        wait = waitForSlideDuration
    } = {}
) {
    if (signal.aborted || slides.length === 0) {
        return false;
    }

    let activeSlideIndex = displaySlide(
        slides,
        initialSlideIndex
    );

    while (!signal.aborted) {
        const durationCompleted = await wait(
            options.durationSeconds,
            signal
        );

        if (!durationCompleted) {
            return false;
        }

        activeSlideIndex = displaySlide(
            slides,
            activeSlideIndex + 1
        );
    }

    return false;
}


export function stopSlideshow() {
    if (activeSlideshowLifecycle === null) {
        return false;
    }

    const lifecycle = activeSlideshowLifecycle;

    activeSlideshowLifecycle = null;
    lifecycle.controller.abort();

    return true;
}


export function startSlideshow(
    slides,
    options,
    {
        createController = () => new AbortController(),
        displaySlide = showSlide,
        initialSlideIndex = 0,
        runLoop = runSlideshowLoop
    } = {}
) {
    stopSlideshow();

    const controller = createController();
    const lifecycle = {
        controller,
        completion: null
    };

    activeSlideshowLifecycle = lifecycle;
    lifecycle.completion = Promise.resolve().then(
        () => runLoop(
            slides,
            options,
            controller.signal,
            {
                displaySlide,
                initialSlideIndex
            }
        )
    );

    const clearLifecycle = () => {
        if (activeSlideshowLifecycle === lifecycle) {
            activeSlideshowLifecycle = null;
        }
    };

    lifecycle.completion.then(clearLifecycle, clearLifecycle);

    return lifecycle;
}


export function initializeSlideshowResizeHandling(
    elements,
    refreshLayout,
    {
        windowObject = window,
        ResizeObserverClass = ResizeObserver,
        requestFrame = requestAnimationFrame,
        cancelFrame = cancelAnimationFrame
    } = {}
) {
    let resizeFrame = null;
    let disposed = false;

    const runRefresh = () => {
        resizeFrame = null;

        if (!disposed) {
            refreshLayout();
        }
    };
    const scheduleRefresh = () => {
        if (disposed) {
            return;
        }

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

            return true;
        }
    };
}
