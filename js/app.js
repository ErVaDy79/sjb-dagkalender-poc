import { loadAppConfig } from "./config.js";
import {
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
  markAllPagesAsDisplayable
} from "./pages.js";
import {
  showCurrentPage,
  showNextPage
} from "./pageLoop.js";

let appConfig = null;
let calendarPages = [];

async function refreshTimeBasedDisplay() {
  try {
    const serverTime = await getCurrentServerTime();
    const currentMinutesSinceMidnight = getMinutesSinceMidnight(serverTime, appConfig);

    updateDisplayPageFlags(calendarPages, currentMinutesSinceMidnight, appConfig);
    showServerTime(serverTime, appConfig);

    console.log("Displayable calendar pages:", calendarPages.filter(function (page) {
      return page.displayPage === true;
    }));
  } catch (error) {
    markAllPagesAsDisplayable(calendarPages);
    showServerTimeUnavailable();
    console.warn("Server time unavailable. All pages will be displayed.", error);
  }

  showCurrentPage(calendarPages);
}

async function startApp() {
  appConfig = await loadAppConfig();

  console.log("Loaded app config:", appConfig);

  const schoolHours = await loadSchoolHours();

  console.log("Loaded school hours:", schoolHours);

  calendarPages = createCalendarPages(schoolHours);

  console.log("Created calendar pages:", calendarPages);

  markAllPagesAsDisplayable(calendarPages);

  showCurrentPage(calendarPages);
  refreshTimeBasedDisplay();

  setInterval(function () {
    showNextPage(calendarPages);
  }, appConfig.pageDurationSeconds * 1000);

  setInterval(function () {
    refreshTimeBasedDisplay();
  }, appConfig.serverTimeRefreshSeconds * 1000);
}

startApp();