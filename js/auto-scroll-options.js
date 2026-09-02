import {
    AUTO_SCROLL_DEFAULTS,
    AUTO_SCROLL_LIMITS,
    AUTO_SCROLL_PARAMETER_NAMES
} from "./config/auto-scroll-config.js";

const DECIMAL_NUMBER_PATTERN = /^(?:\d+(?:\.\d+)?|\.\d+)$/;


function getNumericOption(
    parameters,
    name,
    defaultValue,
    limits
) {
    const values = parameters.getAll(name);

    if (values.length !== 1) {
        return defaultValue;
    }

    const text = values[0].trim();

    if (!DECIMAL_NUMBER_PATTERN.test(text)) {
        return defaultValue;
    }

    const value = Number(text);

    if (
        !Number.isFinite(value)
        || value < limits.minimum
        || value > limits.maximum
    ) {
        return defaultValue;
    }

    return value;
}


export function getAutoScrollOptions(
    search = window.location.search
) {
    const parameters = new URLSearchParams(search);

    return {
        speedPixelsPerSecond: getNumericOption(
            parameters,
            AUTO_SCROLL_PARAMETER_NAMES.speed,
            AUTO_SCROLL_DEFAULTS.speedPixelsPerSecond,
            AUTO_SCROLL_LIMITS.speedPixelsPerSecond
        ),
        topPauseSeconds: getNumericOption(
            parameters,
            AUTO_SCROLL_PARAMETER_NAMES.topPause,
            AUTO_SCROLL_DEFAULTS.topPauseSeconds,
            AUTO_SCROLL_LIMITS.pauseSeconds
        ),
        bottomPauseSeconds: getNumericOption(
            parameters,
            AUTO_SCROLL_PARAMETER_NAMES.bottomPause,
            AUTO_SCROLL_DEFAULTS.bottomPauseSeconds,
            AUTO_SCROLL_LIMITS.pauseSeconds
        )
    };
}
