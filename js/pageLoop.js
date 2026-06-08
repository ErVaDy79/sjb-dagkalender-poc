import { showPage } from "./renderer.js";
import {
  getDisplayablePages,
  markAllPagesAsDisplayable
} from "./pages.js";

let currentPageIndex = 0;

export function showCurrentPage(calendarPages) {
  const displayablePages = getDisplayablePages(calendarPages);

  if (displayablePages.length === 0) {
    markAllPagesAsDisplayable(calendarPages);
    currentPageIndex = 0;
    showCurrentPage(calendarPages);
    return;
  }

  if (currentPageIndex >= displayablePages.length) {
    currentPageIndex = 0;
  }

  const currentPage = displayablePages[currentPageIndex];

  showPage(currentPage, currentPageIndex, displayablePages.length);
}

export function showNextPage(calendarPages) {
  const displayablePages = getDisplayablePages(calendarPages);

  currentPageIndex = currentPageIndex + 1;

  if (currentPageIndex >= displayablePages.length) {
    currentPageIndex = 0;
  }

  showCurrentPage(calendarPages);
}