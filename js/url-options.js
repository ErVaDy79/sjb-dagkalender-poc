import {
    DATE_PARAMETER_FORMAT,
    MAX_CALENDAR_YEAR,
    MIN_CALENDAR_YEAR
} from "./config/calendar-config.js";


export class UrlOptionError extends Error {
    constructor(message) {
        super(message);
        this.name = "UrlOptionError";
    }
}


function getSingleParameter(parameters, name) {
    const values = parameters.getAll(name);

    if (values.length > 1) {
        throw new UrlOptionError(
            `URL parameter '${name}' may only occur once.`
        );
    }

    return values.length === 1 ? values[0] : null;
}


function isValidDate(year, month, day) {
    const candidate = new Date(Date.UTC(year, month - 1, day));

    return (
        candidate.getUTCFullYear() === year
        && candidate.getUTCMonth() === month - 1
        && candidate.getUTCDate() === day
    );
}


export function parseDateParameter(value) {
    if (value === null) {
        return null;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (match === null) {
        throw new UrlOptionError(
            `The date parameter must use ${DATE_PARAMETER_FORMAT}.`
        );
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (year < MIN_CALENDAR_YEAR || year > MAX_CALENDAR_YEAR) {
        throw new UrlOptionError(
            "The date parameter year must be between "
            + `${MIN_CALENDAR_YEAR} and ${MAX_CALENDAR_YEAR}.`
        );
    }

    if (!isValidDate(year, month, day)) {
        throw new UrlOptionError(
            `The date parameter is not a valid date: ${value}`
        );
    }

    return {
        year,
        month,
        day
    };
}


export function getUrlOptions(search = window.location.search) {
    const parameters = new URLSearchParams(search);
    const dateValue = getSingleParameter(parameters, "date");

    return {
        requestedDate: parseDateParameter(dateValue),
        hasDateOverride: dateValue !== null
    };
}
