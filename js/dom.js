export function getRequiredElement(id, context = "page") {
    const element = document.getElementById(id);

    if (element === null) {
        throw new Error(
            `Required ${context} element is missing: #${id}`
        );
    }

    return element;
}
