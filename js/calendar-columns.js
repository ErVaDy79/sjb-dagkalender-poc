import {
    CALENDAR_COLUMNS,
    MIN_CALENDAR_COLUMN_WIDTH
} from "./config/calendar-config.js";


function getCalendarLineElements(calendarElements) {
    const roots = [
        calendarElements.announcementsElement,
        ...calendarElements.scheduleElements
    ];

    return roots.flatMap(
        (root) => [...root.querySelectorAll(".calendar-line")]
    );
}


export function measureCellContentWidth(cellElement) {
    if (!cellElement.hasChildNodes()) {
        return 0;
    }

    const range = document.createRange();

    range.selectNodeContents(cellElement);

    return Math.max(0, range.getBoundingClientRect().width);
}


export function measureColumnRequirements(calendarElements) {
    const constraints = [];

    for (const line of getCalendarLineElements(calendarElements)) {
        for (const cell of line.querySelectorAll(".calendar-cell")) {
            if (cell.dataset.occupied !== "true") {
                continue;
            }

            const startIndex = CALENDAR_COLUMNS.indexOf(
                cell.dataset.column
            );
            const requestedSpan = Number(cell.dataset.columnSpan);
            const span = Number.isInteger(requestedSpan)
                ? Math.max(
                    1,
                    Math.min(
                        requestedSpan,
                        CALENDAR_COLUMNS.length - startIndex
                    )
                )
                : 1;

            if (startIndex !== -1) {
                constraints.push({
                    startIndex,
                    endIndex: startIndex + span,
                    width: measureCellContentWidth(cell)
                });
            }
        }
    }

    const forwardWidths = solveMinimumWidths(constraints);
    const reversedConstraints = constraints.map((constraint) => ({
        startIndex: CALENDAR_COLUMNS.length - constraint.endIndex,
        endIndex: CALENDAR_COLUMNS.length - constraint.startIndex,
        width: constraint.width
    }));
    const reverseWidths = solveMinimumWidths(reversedConstraints).reverse();

    return Object.fromEntries(
        CALENDAR_COLUMNS.map((column, index) => [
            column,
            (forwardWidths[index] + reverseWidths[index]) / 2
        ])
    );
}


function solveMinimumWidths(constraints) {
    const prefixWidths = Array(CALENDAR_COLUMNS.length + 1)
        .fill(Number.NEGATIVE_INFINITY);
    const constraintsByStart = Array.from(
        { length: CALENDAR_COLUMNS.length },
        () => []
    );

    prefixWidths[0] = 0;

    for (const constraint of constraints) {
        constraintsByStart[constraint.startIndex].push(constraint);
    }

    for (
        let columnIndex = 0;
        columnIndex < CALENDAR_COLUMNS.length;
        columnIndex += 1
    ) {
        prefixWidths[columnIndex + 1] = Math.max(
            prefixWidths[columnIndex + 1],
            prefixWidths[columnIndex] + MIN_CALENDAR_COLUMN_WIDTH
        );

        for (const constraint of constraintsByStart[columnIndex]) {
            prefixWidths[constraint.endIndex] = Math.max(
                prefixWidths[constraint.endIndex],
                prefixWidths[columnIndex] + constraint.width
            );
        }
    }

    return CALENDAR_COLUMNS.map(
        (_, index) => prefixWidths[index + 1] - prefixWidths[index]
    );
}


export function normalizeColumnRatios(widths) {
    const normalizedWidths = CALENDAR_COLUMNS.map((column) => {
        const width = Number(widths[column]);

        return Number.isFinite(width) && width > 0
            ? width
            : MIN_CALENDAR_COLUMN_WIDTH;
    });
    const totalWidth = normalizedWidths.reduce(
        (total, width) => total + width,
        0
    );

    return Object.fromEntries(
        CALENDAR_COLUMNS.map((column, index) => [
            column,
            normalizedWidths[index] / totalWidth
        ])
    );
}


export function buildGridColumnDefinition(ratios) {
    return CALENDAR_COLUMNS
        .map((column) => `minmax(0, ${ratios[column]}fr)`)
        .join(" ");
}


export function applyGridColumnDefinition(
    calendarElements,
    definition
) {
    for (const line of getCalendarLineElements(calendarElements)) {
        line.style.setProperty("--calendar-grid-columns", definition);
    }
}


export function calculateCalendarColumns(calendarElements) {
    const widths = measureColumnRequirements(calendarElements);
    const ratios = normalizeColumnRatios(widths);
    const definition = buildGridColumnDefinition(ratios);

    applyGridColumnDefinition(calendarElements, definition);

    return {
        widths,
        ratios,
        definition
    };
}
