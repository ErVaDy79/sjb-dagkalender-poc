import {
    ANNOUNCEMENTS_TITLE,
    CALENDAR_STATUS_TEXT,
    CALENDAR_COLUMNS,
    EMPTY_CONTENT_TEXT,
    PAUSE_BLOCK_LABELS
} from "./config/calendar-config.js";
import { CalendarLoadError } from "./calendar-data.js";
import {
    CalendarNormalizationError,
    hasVisibleContent
} from "./calendar-normalizer.js";
import { formatCalendarDate } from "./dates.js";
import { UrlOptionError } from "./url-options.js";


function fillStatusTemplate(template, values) {
    return Object.entries(values).reduce(
        (message, [name, value]) => message.replace(`{${name}}`, value),
        template
    );
}


export function getCalendarErrorStatus(error) {
    if (error instanceof UrlOptionError) {
        return {
            type: "error",
            code: "invalid-date",
            message: CALENDAR_STATUS_TEXT.invalidDate
        };
    }

    if (error instanceof CalendarLoadError) {
        if (error.code === "not-found") {
            return {
                type: "error",
                code: error.code,
                message: fillStatusTemplate(
                    CALENDAR_STATUS_TEXT.notFound,
                    { date: formatCalendarDate(error.date) }
                )
            };
        }

        if (error.code === "network") {
            return {
                type: "error",
                code: error.code,
                message: CALENDAR_STATUS_TEXT.network
            };
        }

        if (error.code === "http") {
            return {
                type: "error",
                code: error.code,
                message: fillStatusTemplate(
                    CALENDAR_STATUS_TEXT.http,
                    { status: error.status }
                )
            };
        }

        if (error.code === "invalid-json") {
            return {
                type: "error",
                code: error.code,
                message: CALENDAR_STATUS_TEXT.invalidJson
            };
        }
    }

    if (error instanceof CalendarNormalizationError) {
        return {
            type: "error",
            code: "invalid-structure",
            message: CALENDAR_STATUS_TEXT.invalidStructure
        };
    }

    return {
        type: "error",
        code: "unexpected",
        message: CALENDAR_STATUS_TEXT.unexpected
    };
}


function renderStatus(container, status) {
    container.dataset.statusType = status.type;
    container.dataset.statusCode = status.code;
    container.setAttribute(
        "role",
        status.type === "error" ? "alert" : "status"
    );
    container.textContent = status.message;

    return status;
}


export function renderLoading(container) {
    return renderStatus(container, {
        type: "loading",
        code: "loading",
        message: CALENDAR_STATUS_TEXT.loading
    });
}


export function renderError(container, error) {
    return renderStatus(container, getCalendarErrorStatus(error));
}


export function createCalendarDateElement(date) {
    if (date === null) {
        return null;
    }

    const element = document.createElement("div");

    element.classList.add("calendar-date-content");
    element.innerHTML = date.html;

    return element;
}


export function createCellElement(cell, column, columnSpan = 1) {
    const element = document.createElement("div");
    const columnIndex = CALENDAR_COLUMNS.indexOf(column);

    element.classList.add("calendar-cell");
    element.dataset.column = column;
    element.dataset.columnSpan = String(columnSpan);
    element.dataset.occupied = String(cell !== null);
    element.style.setProperty(
        "grid-column",
        `${columnIndex + 1} / span ${columnSpan}`
    );

    if (cell !== null) {
        element.innerHTML = cell.html;

        if (cell.background_color !== null) {
            element.style.backgroundColor = cell.background_color;
        }
    }

    return element;
}


function getCellColumnSpan(line, columnIndex) {
    const column = CALENDAR_COLUMNS[columnIndex];

    if (line.cells[column] === null) {
        return 1;
    }

    const nextOccupiedIndex = CALENDAR_COLUMNS.findIndex(
        (nextColumn, nextIndex) => (
            nextIndex > columnIndex
            && line.cells[nextColumn] !== null
        )
    );

    return nextOccupiedIndex === -1
        ? CALENDAR_COLUMNS.length - columnIndex
        : nextOccupiedIndex - columnIndex;
}


export function createLineElement(line) {
    const element = document.createElement("div");

    element.classList.add("calendar-line");
    element.style.setProperty(
        "--calendar-column-count",
        CALENDAR_COLUMNS.length
    );

    for (const [columnIndex, column] of CALENDAR_COLUMNS.entries()) {
        element.append(
            createCellElement(
                line.cells[column],
                column,
                getCellColumnSpan(line, columnIndex)
            )
        );
    }

    return element;
}


export function createLinesElement(lines) {
    const element = document.createElement("div");

    element.classList.add("calendar-lines");
    element.append(...lines.map(createLineElement));

    return element;
}


export function createEmptyMessageElement() {
    const element = document.createElement("div");

    element.classList.add("calendar-empty-message");
    element.textContent = EMPTY_CONTENT_TEXT;

    return element;
}


function createBlockHeader(title, timeText = null) {
    const header = document.createElement("header");
    const titleElement = document.createElement("h2");

    header.classList.add("calendar-block-header");
    titleElement.classList.add("calendar-block-title");
    titleElement.textContent = title;

    if (timeText !== null) {
        const timeElement = document.createElement("span");

        timeElement.classList.add("calendar-block-time");
        timeElement.textContent = `(${timeText})`;
        titleElement.append(timeElement);
    }

    header.append(titleElement);

    return header;
}


function createBlockContent(lines) {
    return hasVisibleContent(lines)
        ? createLinesElement(lines)
        : createEmptyMessageElement();
}


export function createAnnouncementsElement(announcements) {
    const element = document.createElement("section");

    element.classList.add(
        "calendar-block",
        "calendar-block--announcements"
    );
    element.append(
        createBlockHeader(ANNOUNCEMENTS_TITLE),
        createBlockContent(announcements.lines)
    );

    return element;
}


export function getScheduleBlockType(block) {
    return PAUSE_BLOCK_LABELS.includes(block.label)
        ? "pause"
        : "lesson";
}


export function createScheduleBlockElement(block) {
    const element = document.createElement("section");
    const blockType = getScheduleBlockType(block);
    const timeText = block.start_time !== null && block.end_time !== null
        ? `${block.start_time} – ${block.end_time}`
        : null;

    element.classList.add(
        "calendar-block",
        "calendar-block--schedule",
        `calendar-block--${blockType}`
    );
    element.dataset.blockLabel = block.label;
    element.append(
        createBlockHeader(block.title, timeText),
        createBlockContent(block.lines)
    );

    return element;
}


export function createCalendarElements(data) {
    return {
        dateElement: createCalendarDateElement(data.date),
        announcementsElement: createAnnouncementsElement(data.announcements),
        scheduleElements: data.schedule.map(createScheduleBlockElement)
    };
}
