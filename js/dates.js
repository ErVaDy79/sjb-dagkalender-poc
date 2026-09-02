import {
    CALENDAR_FILENAME_EXTENSION,
    CALENDAR_FILENAME_SEPARATOR,
    CALENDAR_MONTH_NAMES,
    CALENDAR_WEEKDAY_CODES,
    CALENDAR_WEEKDAY_NAMES
} from "./config/calendar-config.js";


function padNumber(value) {
    return String(value).padStart(2, "0");
}


function getWeekdayCode(date) {
    const localDate = new Date(
        date.year,
        date.month - 1,
        date.day
    );

    return CALENDAR_WEEKDAY_CODES[localDate.getDay()];
}


export function getLocalToday(now = new Date()) {
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
    };
}


export function getDisplayDate(options, now = new Date()) {
    return options.requestedDate ?? getLocalToday(now);
}


export function buildCalendarFilename(date) {
    const parts = [
        getWeekdayCode(date),
        padNumber(date.day),
        CALENDAR_MONTH_NAMES[date.month - 1],
        padNumber(date.year % 100)
    ];

    return (
        parts.join(CALENDAR_FILENAME_SEPARATOR)
        + CALENDAR_FILENAME_EXTENSION
    );
}


export function formatCalendarDate(date) {
    const localDate = new Date(date.year, date.month - 1, date.day);

    return [
        CALENDAR_WEEKDAY_NAMES[localDate.getDay()],
        date.day,
        CALENDAR_MONTH_NAMES[date.month - 1],
        date.year
    ].join(" ");
}
