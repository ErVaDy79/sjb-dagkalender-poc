import { DEFAULT_DISPLAY_PAGE } from "../config/app-config.js";


export function openDefaultDisplay() {
    const displayUrl = new URL(DEFAULT_DISPLAY_PAGE, document.baseURI);

    displayUrl.search = window.location.search;
    displayUrl.hash = window.location.hash;

    window.location.replace(displayUrl);
}


openDefaultDisplay();
