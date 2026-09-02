import {
    CALENDAR_SCALE_PRECISION,
    MAX_CALENDAR_SCALE,
    MIN_CALENDAR_SCALE
} from "./config/calendar-config.js";


export function contentFits(
    contentSize,
    containerSize,
    {
        width = true,
        height = true
    } = {}
) {
    return (
        (!width || contentSize.width <= containerSize.width)
        && (!height || contentSize.height <= containerSize.height)
    );
}


export function getContainerSize(container) {
    const rect = container.getBoundingClientRect();
    const style = getComputedStyle(container);

    return {
        width:
            rect.width
            - parseFloat(style.paddingLeft)
            - parseFloat(style.paddingRight)
            - parseFloat(style.borderLeftWidth)
            - parseFloat(style.borderRightWidth),
        height:
            rect.height
            - parseFloat(style.paddingTop)
            - parseFloat(style.paddingBottom)
            - parseFloat(style.borderTopWidth)
            - parseFloat(style.borderBottomWidth)
    };
}


export function getContentSize(content) {
    const rect = content.getBoundingClientRect();
    const horizontalOverflow = Math.max(
        0,
        content.scrollWidth - content.clientWidth
    );
    const verticalOverflow = Math.max(
        0,
        content.scrollHeight - content.clientHeight
    );

    return {
        width: rect.width + horizontalOverflow,
        height: rect.height + verticalOverflow
    };
}


export function prepareMeasurementContainer(
    container,
    measurementContainer
) {
    const containerSize = getContainerSize(container);

    measurementContainer.style.width = `${containerSize.width}px`;
}


export function setContentScale(content, scale) {
    content.style.setProperty("--scale", scale);
}


export function measureContentAtScale(content, scale) {
    setContentScale(content, scale);

    return getContentSize(content);
}


export function findContentScale(
    content,
    container,
    {
        minScale = MIN_CALENDAR_SCALE,
        maxScale = MAX_CALENDAR_SCALE,
        precision = CALENDAR_SCALE_PRECISION,
        constraints = {}
    } = {}
) {
    const containerSize = getContainerSize(container);
    let low = minScale;
    let high = maxScale;
    let bestScale = minScale;

    while (high - low > precision) {
        const scale = (low + high) / 2;
        const contentSize = measureContentAtScale(content, scale);

        if (contentFits(contentSize, containerSize, constraints)) {
            bestScale = scale;
            low = scale;
        } else {
            high = scale;
        }
    }

    return bestScale;
}


function copyContentForMeasurement(source, measurementContent) {
    const clonedNodes = [...source.childNodes].map(
        (node) => node.cloneNode(true)
    );

    measurementContent.replaceChildren(...clonedNodes);
}


function findScaleForContent(
    content,
    container,
    measurementContainer,
    measurementContent,
    options
) {
    prepareMeasurementContainer(container, measurementContainer);
    copyContentForMeasurement(content, measurementContent);

    return findContentScale(
        measurementContent,
        container,
        options
    );
}


export function findSharedScale(
    leftContent,
    leftContainer,
    rightContent,
    rightContainer,
    measurementContainer,
    measurementContent,
    minScale = MIN_CALENDAR_SCALE,
    maxScale = MAX_CALENDAR_SCALE,
    precision = CALENDAR_SCALE_PRECISION
) {
    const options = {
        minScale,
        maxScale,
        precision
    };
    const leftScale = findScaleForContent(
        leftContent,
        leftContainer,
        measurementContainer,
        measurementContent,
        options
    );
    const rightScale = findScaleForContent(
        rightContent,
        rightContainer,
        measurementContainer,
        measurementContent,
        options
    );

    measurementContent.replaceChildren();

    return Math.min(leftScale, rightScale);
}
