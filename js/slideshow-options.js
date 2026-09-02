import {
    SLIDESHOW_DEFAULTS,
    SLIDESHOW_LIMITS,
    SLIDESHOW_PARAMETER_NAMES
} from "./config/slideshow-config.js";

const DECIMAL_NUMBER_PATTERN = /^(?:\d+(?:\.\d+)?|\.\d+)$/;


function getDurationOption(parameters) {
    const values = parameters.getAll(
        SLIDESHOW_PARAMETER_NAMES.duration
    );

    if (values.length !== 1) {
        return SLIDESHOW_DEFAULTS.durationSeconds;
    }

    const text = values[0].trim();

    if (!DECIMAL_NUMBER_PATTERN.test(text)) {
        return SLIDESHOW_DEFAULTS.durationSeconds;
    }

    const durationSeconds = Number(text);
    const limits = SLIDESHOW_LIMITS.durationSeconds;

    if (
        !Number.isFinite(durationSeconds)
        || durationSeconds < limits.minimum
        || durationSeconds > limits.maximum
    ) {
        return SLIDESHOW_DEFAULTS.durationSeconds;
    }

    return durationSeconds;
}


export function getSlideshowOptions(
    search = window.location.search
) {
    const parameters = new URLSearchParams(search);

    return {
        durationSeconds: getDurationOption(parameters)
    };
}
