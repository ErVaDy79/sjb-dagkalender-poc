import { loadAppConfig } from "./config.js";
import {
  showPage,
  showServerTime,
  showServerTimeUnavailable
} from "./renderer.js";
import {
  getCurrentServerTime,
  getMinutesSinceMidnight
} from "./time.js";
import { loadSchoolHours } from "./schoolHours.js";
import {
  createCalendarPages,
  updateDisplayPageFlags,
  markAllPagesAsDisplayable,
  getDisplayablePages
} from "./pages.js";

let appConfig = null;
let calendarPages = [];
let currentPageIndex = 0;

function showCurrentPage() {
  const displayablePages = getDisplayablePages(calendarPages);

  if (displayablePages.length === 0) {
    markAllPagesAsDisplayable(calendarPages);
    showCurrentPage();
    return;
  }

  if (currentPageIndex >= displayablePages.length) {
    currentPageIndex = 0;
  }

  const currentPage = displayablePages[currentPageIndex];

  showPage(currentPage, currentPageIndex, displayablePages.length);
}

function showNextPage() {
  const displayablePages = getDisplayablePages(calendarPages);

  currentPageIndex = currentPageIndex + 1;

  if (currentPageIndex >= displayablePages.length) {
    currentPageIndex = 0;
  }

  showCurrentPage();
}

async function updateServerTimeAndPageFlags() {
  try {
    const serverTime = await getCurrentServerTime();
    const currentMinutesSinceMidnight = getMinutesSinceMidnight(serverTime, appConfig);

    updateDisplayPageFlags(calendarPages, currentMinutesSinceMidnight);
    showServerTime(serverTime, appConfig);
  } catch (error) {
    markAllPagesAsDisplayable(calendarPages);
    showServerTimeUnavailable();
    console.warn("Server time unavailable. All pages will be displayed.", error);
  }

  showCurrentPage();
}

async function startApp() {
  appConfig = await loadAppConfig();

  const schoolHours = await loadSchoolHours();
  calendarPages = createCalendarPages(schoolHours);

  showCurrentPage();
  updateServerTimeAndPageFlags();

  setInterval(showNextPage, appConfig.pageDurationSeconds * 1000);
  setInterval(updateServerTimeAndPageFlags, appConfig.serverTimeRefreshSeconds * 1000);
}

startApp();