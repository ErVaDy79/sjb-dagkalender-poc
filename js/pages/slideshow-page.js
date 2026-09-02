import { loadSelectedCalendar } from "../calendar-data.js";
import {
    getSlideshowElements,
    initializeSlideshowResizeHandling,
    refreshSlideshowLayout,
    renderSlideshowCalendar,
    showSlide,
    showSlideshowError,
    showSlideshowLoading,
    startSlideshow,
    stopSlideshow
} from "../displays/slideshow.js";
import { waitForInitialLayout } from "../page-layout.js";
import { getSlideshowOptions } from "../slideshow-options.js";
import { getUrlOptions } from "../url-options.js";


export async function initializeSlideshowPage(
    {
        getElements = getSlideshowElements,
        getCalendarOptions = getUrlOptions,
        getDisplayOptions = getSlideshowOptions,
        loadCalendar = loadSelectedCalendar,
        renderCalendar = renderSlideshowCalendar,
        waitForLayout = waitForInitialLayout,
        refreshLayout = refreshSlideshowLayout,
        startSlides = startSlideshow,
        initializeResizeHandling = initializeSlideshowResizeHandling
    } = {}
) {
    const elements = getElements();

    showSlideshowLoading(elements);

    try {
        const calendarOptions = getCalendarOptions();
        const displayOptions = getDisplayOptions();
        const calendar = await loadCalendar(calendarOptions);
        const calendarElements = renderCalendar(
            calendar.data,
            elements
        );

        await waitForLayout();

        let activeSlideIndex = calendarElements.activeSlideIndex;
        let layout = refreshLayout(
            calendarElements,
            elements,
            activeSlideIndex
        );
        let resizeHandling = null;

        activeSlideIndex = layout.activeSlideIndex;

        const handleSlideshowError = (error) => {
            resizeHandling?.dispose();
            stopSlideshow();
            showSlideshowError(elements, error);
            console.error("Calendar slideshow failed.", error);
        };
        const displaySlide = (slides, index) => {
            activeSlideIndex = showSlide(slides, index);
            return activeSlideIndex;
        };
        let slideshow = null;
        const startSlideLoop = (initialSlideIndex) => {
            slideshow = startSlides(
                calendarElements.slides,
                displayOptions,
                {
                    displaySlide,
                    initialSlideIndex
                }
            );
            slideshow.completion.catch(handleSlideshowError);

            return slideshow;
        };
        const refreshSharedLayout = () => {
            try {
                layout = refreshLayout(
                    calendarElements,
                    elements,
                    activeSlideIndex
                );
                activeSlideIndex = layout.activeSlideIndex;
                return layout;
            } catch (error) {
                handleSlideshowError(error);
                return null;
            }
        };
        const refreshSharedLayoutAndRestart = () => {
            const nextLayout = refreshSharedLayout();

            if (nextLayout !== null) {
                startSlideLoop(activeSlideIndex);
            }

            return nextLayout;
        };

        startSlideLoop(activeSlideIndex);
        resizeHandling = initializeResizeHandling(
            elements,
            refreshSharedLayoutAndRestart
        );

        return {
            elements,
            calendarOptions,
            displayOptions,
            calendar,
            calendarElements,
            layout,
            slideshow,
            resizeHandling
        };
    } catch (error) {
        const status = showSlideshowError(elements, error);

        console.error("Calendar page initialization failed.", error);

        return {
            elements,
            error,
            status
        };
    }
}


if (typeof window !== "undefined" && typeof document !== "undefined") {
    let activePage = null;

    window.addEventListener("pagehide", () => {
        activePage?.resizeHandling?.dispose();
        stopSlideshow();
    });
    initializeSlideshowPage().then((page) => {
        activePage = page;
    });
}
