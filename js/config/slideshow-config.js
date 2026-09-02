export const SLIDESHOW_PARAMETER_NAMES = Object.freeze({
    duration: "duration"
});

export const SLIDESHOW_DEFAULTS = Object.freeze({
    durationSeconds: 8
});

export const SLIDESHOW_LIMITS = Object.freeze({
    durationSeconds: Object.freeze({
        minimum: 0.1,
        maximum: 3600
    })
});
