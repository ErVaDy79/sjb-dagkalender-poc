import {
    CALENDAR_COLUMNS,
    CALENDAR_TIME_PATTERN
} from "./config/calendar-config.js";

const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/i;
const HTML_TAG_PATTERN = /<[^>]*>/g;
const INVISIBLE_HTML_PATTERN = /(?:&nbsp;|&#160;|&#xA0;|\s)+/gi;


export class CalendarNormalizationError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = "CalendarNormalizationError";
        Object.assign(this, details);
    }
}


function isObject(value) {
    return value !== null
        && typeof value === "object"
        && !Array.isArray(value);
}


export function isValidBackgroundColor(value) {
    return typeof value === "string" && HEX_COLOR_PATTERN.test(value);
}


export function normalizeCell(cell) {
    if (!isObject(cell) || typeof cell.html !== "string") {
        return null;
    }

    return {
        html: cell.html,
        background_color: isValidBackgroundColor(cell.background_color)
            ? cell.background_color
            : null
    };
}


export function normalizeLine(line) {
    const sourceCells = isObject(line) && isObject(line.cells)
        ? line.cells
        : {};
    const cells = {};

    for (const column of CALENDAR_COLUMNS) {
        cells[column] = normalizeCell(sourceCells[column]);
    }

    return { cells };
}


export function normalizeLines(lines) {
    if (!Array.isArray(lines)) {
        return [];
    }

    return lines.map(normalizeLine);
}


export function normalizeDateCell(date) {
    return normalizeCell(date);
}


export function normalizeAnnouncements(value) {
    return {
        lines: normalizeLines(isObject(value) ? value.lines : null)
    };
}


export function normalizeScheduleBlock(block) {
    if (!isObject(block)) {
        return null;
    }

    const label = typeof block.label === "string" ? block.label : "";
    const title = typeof block.title === "string"
        && block.title.trim() !== ""
        ? block.title
        : label;
    const hasValidTimes = CALENDAR_TIME_PATTERN.test(block.start_time)
        && CALENDAR_TIME_PATTERN.test(block.end_time)
        && block.start_time < block.end_time;

    return {
        label,
        title,
        start_time: hasValidTimes ? block.start_time : null,
        end_time: hasValidTimes ? block.end_time : null,
        lines: normalizeLines(block.lines)
    };
}


export function normalizeSchedule(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map(normalizeScheduleBlock)
        .filter((block) => block !== null);
}


function containsVisibleHtml(html) {
    return html
        .replace(HTML_TAG_PATTERN, "")
        .replace(INVISIBLE_HTML_PATTERN, "") !== "";
}


export function hasVisibleContent(lines) {
    if (!Array.isArray(lines)) {
        return false;
    }

    return lines.some((line) => {
        if (!isObject(line) || !isObject(line.cells)) {
            return false;
        }

        return CALENDAR_COLUMNS.some((column) => {
            const cell = line.cells[column];

            return isObject(cell)
                && typeof cell.html === "string"
                && containsVisibleHtml(cell.html);
        });
    });
}


export function normalizeCalendarData(data) {
    if (!isObject(data)) {
        throw new CalendarNormalizationError(
            "Calendar data must be a JSON object.",
            { code: "invalid-root" }
        );
    }

    return {
        date: normalizeDateCell(data.date),
        announcements: normalizeAnnouncements(data.announcements),
        schedule: normalizeSchedule(data.schedule)
    };
}
