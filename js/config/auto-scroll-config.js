export const AUTO_SCROLL_PARAMETER_NAMES = Object.freeze({
    speed: "speed",
    topPause: "pauseTop",
    bottomPause: "pauseBottom"
});

export const AUTO_SCROLL_DEFAULTS = Object.freeze({
    speedPixelsPerSecond: 40,
    topPauseSeconds: 5,
    bottomPauseSeconds: 5
});

export const AUTO_SCROLL_LIMITS = Object.freeze({
    speedPixelsPerSecond: Object.freeze({
        minimum: 1,
        maximum: 500
    }),
    pauseSeconds: Object.freeze({
        minimum: 0,
        maximum: 300
    })
});
