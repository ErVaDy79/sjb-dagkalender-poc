import { getAutoScrollOptions } from "../auto-scroll-options.js";
import { loadSelectedCalendar } from "../calendar-data.js";
import {
    getAutoScrollElements,
    initializeAutoScrollResizeHandling,
    refreshAutoScrollLayout,
    renderAutoScrollCalendar,
    showAutoScrollError,
    showAutoScrollLoading,
    startAutoScroll,
    stopAutoScroll
} from "../displays/auto-scroll.js";
import { waitForInitialLayout } from "../page-layout.js";
import { getUrlOptions } from "../url-options.js";


export async function initializeAutoScrollPage(
    {
        getElements = getAutoScrollElements,
        getCalendarOptions = getUrlOptions,
        getScrollOptions = getAutoScrollOptions,
        loadCalendar = loadSelectedCalendar,
        renderCalendar = renderAutoScrollCalendar,
        waitForLayout = waitForInitialLayout,
        refreshLayout = refreshAutoScrollLayout,
        startScrolling = startAutoScroll,
        initializeResizeHandling = initializeAutoScrollResizeHandling
    } = {}
) {
    const elements = getElements();

    showAutoScrollLoading(elements);

    try {
        const calendarOptions = getCalendarOptions();
        const scrollOptions = getScrollOptions();
        const calendar = await loadCalendar(calendarOptions);
        const calendarElements = renderCalendar(
            calendar.data,
            elements
        );

        await waitForLayout();

        let resizeHandling = null;
        const handleScrollError = (error) => {
            resizeHandling?.dispose();
            showAutoScrollError(elements, error);
            console.error("Automatic calendar scrolling failed.", error);
        };
        const startScrollCycle = () => {
            const lifecycle = startScrolling(
                elements.viewport,
                scrollOptions
            );

            lifecycle.completion.catch(handleScrollError);

            return lifecycle;
        };
        const refreshLayoutAndScrolling = () => {
            try {
                const nextLayout = refreshLayout(
                    calendarElements,
                    elements
                );
                const nextScrolling = startScrollCycle();

                return {
                    layout: nextLayout,
                    scrolling: nextScrolling
                };
            } catch (error) {
                handleScrollError(error);
                return null;
            }
        };
        const layout = refreshLayout(calendarElements, elements);
        const scrolling = startScrollCycle();

        resizeHandling = initializeResizeHandling(
            elements,
            refreshLayoutAndScrolling
        );

        return {
            elements,
            calendarOptions,
            scrollOptions,
            calendar,
            calendarElements,
            layout,
            scrolling,
            resizeHandling
        };
    } catch (error) {
        const status = showAutoScrollError(elements, error);

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
        stopAutoScroll();
    });
    initializeAutoScrollPage().then((page) => {
        activePage = page;
    });
}
