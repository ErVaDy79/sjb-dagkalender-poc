import { loadSelectedCalendar } from "../calendar-data.js";
import { waitForInitialLayout } from "../page-layout.js";
import {
    initializeOverview,
    renderOverview,
    showOverviewError,
    showOverviewLoading
} from "../displays/overview.js";
import { getUrlOptions } from "../url-options.js";


export async function initializeOverviewPage() {
    const overview = initializeOverview();
    showOverviewLoading(overview.elements);

    try {
        const options = getUrlOptions();
        const calendar = await loadSelectedCalendar(options);
        const calendarElements = renderOverview(
            calendar.data,
            overview.elements
        );

        await waitForInitialLayout();
        const scale = overview.refreshOverviewScale();

        return {
            overview,
            options,
            calendar,
            calendarElements,
            scale
        };
    } catch (error) {
        const status = showOverviewError(overview.elements, error);

        console.error("Calendar page initialization failed.", error);

        return {
            overview,
            error,
            status
        };
    }
}


if (typeof window !== "undefined" && typeof document !== "undefined") {
    initializeOverviewPage();
}
