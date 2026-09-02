import {
    CALENDAR_COLUMNS,
    COLUMN_BALANCE_TIE_BREAKER,
    COLUMN_BALANCE_WEIGHTS
} from "./config/calendar-config.js";
import { hasVisibleContent } from "./calendar-normalizer.js";


const BREAK_PATTERN = /<br\s*\/?\s*>/gi;


export function countExplicitTextLines(html) {
    if (typeof html !== "string") {
        return 1;
    }

    return 1 + (html.match(BREAK_PATTERN)?.length ?? 0);
}


export function getLineVisualWeight(line) {
    return Math.max(
        1,
        ...CALENDAR_COLUMNS.map((column) => {
            const cell = line.cells[column];

            return cell === null
                ? 1
                : countExplicitTextLines(cell.html);
        })
    );
}


export function getLinesVisualWeight(lines) {
    return lines.reduce(
        (total, line) => total + getLineVisualWeight(line),
        0
    );
}


function getContentVisualWeight(lines) {
    return hasVisibleContent(lines)
        ? getLinesVisualWeight(lines)
        : COLUMN_BALANCE_WEIGHTS.emptyMessage;
}


export function getAnnouncementsWeight(announcements) {
    return COLUMN_BALANCE_WEIGHTS.header
        + getContentVisualWeight(announcements.lines)
        + COLUMN_BALANCE_WEIGHTS.spacing;
}


export function getScheduleBlockWeight(block) {
    return COLUMN_BALANCE_WEIGHTS.header
        + getContentVisualWeight(block.lines)
        + COLUMN_BALANCE_WEIGHTS.spacing;
}


export function findBalancedBlockSplit(announcements, blocks) {
    const announcementWeight = getAnnouncementsWeight(announcements);
    const blockWeights = blocks.map(getScheduleBlockWeight);
    const totalBlockWeight = blockWeights.reduce(
        (total, weight) => total + weight,
        0
    );
    let leftWeight = announcementWeight;
    let bestSplitIndex = 0;
    let smallestDifference = Number.POSITIVE_INFINITY;

    for (let splitIndex = 0; splitIndex <= blocks.length; splitIndex += 1) {
        const rightWeight = totalBlockWeight
            - (leftWeight - announcementWeight);
        const difference = Math.abs(leftWeight - rightWeight);
        const isBetter = difference < smallestDifference;
        const isEqualAndLaterPreferred = (
            difference === smallestDifference
            && COLUMN_BALANCE_TIE_BREAKER === "later"
        );

        if (isBetter || isEqualAndLaterPreferred) {
            bestSplitIndex = splitIndex;
            smallestDifference = difference;
        }

        leftWeight += blockWeights[splitIndex] ?? 0;
    }

    return bestSplitIndex;
}


export function splitCalendarContent(announcements, blocks) {
    const splitIndex = findBalancedBlockSplit(announcements, blocks);

    return {
        splitIndex,
        leftBlocks: blocks.slice(0, splitIndex),
        rightBlocks: blocks.slice(splitIndex)
    };
}
