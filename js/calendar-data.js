import { CALENDAR_DATA_URL } from "./config/app-config.js";
import { normalizeCalendarData } from "./calendar-normalizer.js";
import {
    buildCalendarFilename,
    getDisplayDate
} from "./dates.js";


export class CalendarLoadError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = "CalendarLoadError";
        Object.assign(this, details);
    }
}


export function buildCalendarUrl(date) {
    return new URL(
        buildCalendarFilename(date),
        CALENDAR_DATA_URL
    );
}


export async function loadCalendarData(
    date,
    fetchFunction = fetch
) {
    const url = buildCalendarUrl(date);
    let response;

    try {
        response = await fetchFunction(url, {
            cache: "no-store"
        });
    } catch (error) {
        throw new CalendarLoadError(
            "The calendar file could not be requested.",
            {
                code: "network",
                date,
                url,
                cause: error
            }
        );
    }

    if (response.status === 404) {
        throw new CalendarLoadError(
            "No calendar file exists for the selected date.",
            {
                code: "not-found",
                date,
                status: response.status,
                url
            }
        );
    }

    if (!response.ok) {
        throw new CalendarLoadError(
            `Calendar request failed with status ${response.status}.`,
            {
                code: "http",
                date,
                status: response.status,
                url
            }
        );
    }

    try {
        return await response.json();
    } catch (error) {
        throw new CalendarLoadError(
            "The calendar file does not contain valid JSON.",
            {
                code: "invalid-json",
                date,
                url,
                cause: error
            }
        );
    }
}


export async function loadSelectedCalendar(
    options,
    {
        now = new Date(),
        fetchFunction = fetch
    } = {}
) {
    const date = getDisplayDate(options, now);
    const rawData = await loadCalendarData(date, fetchFunction);
    const data = normalizeCalendarData(rawData);

    return {
        date,
        data
    };
}
