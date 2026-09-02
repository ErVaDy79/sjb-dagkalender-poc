import {
    findSharedScale,
    getContainerSize,
    getContentSize,
    setContentScale
} from "../scaling.js";
import { getRequiredElement } from "../dom.js";
import {
    createCalendarElements,
    renderError,
    renderLoading
} from "../calendar-renderer.js";
import { calculateCalendarColumns } from "../calendar-columns.js";
import { splitCalendarContent } from "../calendar-balance.js";


export function getOverviewElements() {
    return {
        page: getRequiredElement("calendar-page", "overview"),
        statusContainer: getRequiredElement("calendar-status", "overview"),
        dateContainer: getRequiredElement("calendar-date", "overview"),
        leftContainer: getRequiredElement("left-column", "overview"),
        leftContent: getRequiredElement("left-content", "overview"),
        rightContainer: getRequiredElement("right-column", "overview"),
        rightContent: getRequiredElement("right-content", "overview"),
        measurementContainer: getRequiredElement(
            "measurement-container",
            "overview"
        ),
        measurementContent: getRequiredElement(
            "measurement-content",
            "overview"
        )
    };
}


export function showOverviewLoading(elements) {
    elements.page.dataset.pageState = "loading";
    return renderLoading(elements.statusContainer);
}


export function showOverviewError(elements, error) {
    elements.page.dataset.pageState = "error";
    return renderError(elements.statusContainer, error);
}


export function renderOverview(calendar, elements) {
    // Column measurement requires the overview to participate in layout.
    // The browser will not paint until this synchronous render has finished.
    elements.page.dataset.pageState = "ready";

    setContentScale(elements.leftContent, 1);
    setContentScale(elements.rightContent, 1);

    const calendarElements = createCalendarElements(calendar);

    elements.dateContainer.replaceChildren();

    if (calendarElements.dateElement !== null) {
        elements.dateContainer.append(calendarElements.dateElement);
    }

    elements.leftContent.replaceChildren(
        calendarElements.announcementsElement,
        ...calendarElements.scheduleElements
    );
    elements.rightContent.replaceChildren();

    const columnLayout = calculateCalendarColumns(calendarElements);
    const distribution = splitCalendarContent(
        calendar.announcements,
        calendar.schedule
    );

    elements.leftContent.replaceChildren(
        calendarElements.announcementsElement,
        ...calendarElements.scheduleElements.slice(
            0,
            distribution.splitIndex
        )
    );
    elements.rightContent.replaceChildren(
        ...calendarElements.scheduleElements.slice(
            distribution.splitIndex
        )
    );
    return {
        ...calendarElements,
        columnLayout,
        distribution
    };
}


export function scaleOverview(elements) {
    const hasContent = (
        elements.leftContent.hasChildNodes()
        || elements.rightContent.hasChildNodes()
    );
    const scale = hasContent
        ? findSharedScale(
            elements.leftContent,
            elements.leftContainer,
            elements.rightContent,
            elements.rightContainer,
            elements.measurementContainer,
            elements.measurementContent
        )
        : 1;

    setContentScale(elements.leftContent, scale);
    setContentScale(elements.rightContent, scale);

    if (hasContent) {
        publishOverviewScaleReport(elements, scale);
    }

    return scale;
}


function getColumnScaleReport(content, container) {
    const contentSize = getContentSize(content);
    const availableSize = getContainerSize(container);

    return {
        contentWidth: contentSize.width,
        availableWidth: availableSize.width,
        widthUsage: contentSize.width / availableSize.width,
        contentHeight: contentSize.height,
        availableHeight: availableSize.height,
        heightUsage: contentSize.height / availableSize.height
    };
}


export function createOverviewScaleReport(elements, scale) {
    const columns = {
        left: getColumnScaleReport(
            elements.leftContent,
            elements.leftContainer
        ),
        right: getColumnScaleReport(
            elements.rightContent,
            elements.rightContainer
        )
    };
    const constraints = Object.entries(columns).flatMap(
        ([column, sizes]) => [
            {
                column,
                dimension: "width",
                usage: sizes.widthUsage
            },
            {
                column,
                dimension: "height",
                usage: sizes.heightUsage
            }
        ]
    );
    const limitingConstraint = constraints.reduce(
        (highest, constraint) => (
            constraint.usage > highest.usage
                ? constraint
                : highest
        )
    );

    return {
        selectedScale: scale,
        limitingConstraint,
        columns,
        viewport: {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            scrollWidth: document.documentElement.scrollWidth,
            scrollHeight: document.documentElement.scrollHeight
        }
    };
}


function publishOverviewScaleReport(elements, scale) {
    const report = createOverviewScaleReport(elements, scale);

    window.calendarLayoutReport = report;
    console.info("Calendar layout scale report", report);
    console.table(report.columns);
}


export function initializeOverview() {
    const elements = getOverviewElements();
    const refreshOverviewScale = () => scaleOverview(elements);
    let resizeFrame = null;
    const scheduleOverviewScale = () => {
        if (resizeFrame !== null) {
            cancelAnimationFrame(resizeFrame);
        }

        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = null;
            refreshOverviewScale();
        });
    };
    const resizeObserver = new ResizeObserver(scheduleOverviewScale);

    refreshOverviewScale();
    window.addEventListener("resize", scheduleOverviewScale);
    resizeObserver.observe(elements.leftContainer);
    resizeObserver.observe(elements.rightContainer);

    return {
        elements,
        refreshOverviewScale,
        resizeObserver
    };
}
