import { loadAppConfig } from "./config.js";
import {
  showPage,
  showServerTime,
  showServerTimeUnavailable
} from "./renderer.js";
import { getCurrentServerTime } from "./time.js";

// Hardcoded page content for PoC.
// Later this will move to a generated data file.
const calendarPages = [
  {
    title: "Algemene informatie",
    items: [
      "Algemene informatie"
    ]
  },
  {
    title: "L1",
    items: [
      "Info lesuur 1"
    ]
  },
  {
    title: "L2",
    items: [
      "Info lesuur 2"
    ]
  },
  {
    title: "L3",
    items: [
      "Info lesuur 3"
    ]
  },
  {
    title: "L4",
    items: [
      "Info lesuur 4"
    ]
  },
  {
    title: "L5",
    items: [
      "Info lesuur 5"
    ]
  },
  {
    title: "L6",
    items: [
      "Info lesuur 6"
    ]
  },
  {
    title: "L7",
    items: [
      "Info lesuur 7"
    ]
  }
];

let currentPageIndex = 0;

function showCurrentPage() {
  const currentPage = calendarPages[currentPageIndex];

  showPage(currentPage, currentPageIndex, calendarPages.length);
}

function showNextPage() {
  currentPageIndex = currentPageIndex + 1;

  if (currentPageIndex >= calendarPages.length) {
    currentPageIndex = 0;
  }

  showCurrentPage();
}

async function updateServerTimeDisplay() {
  try {
    const serverTime = await getCurrentServerTime();
    showServerTime(serverTime);
  } catch (error) {
    showServerTimeUnavailable();
    console.warn("Server time unavailable. The page loop will continue.", error);
  }
}

async function startApp() {
  const appConfig = await loadAppConfig();

  showCurrentPage();
  updateServerTimeDisplay();

  setInterval(showNextPage, appConfig.pageDurationSeconds * 1000);
  setInterval(updateServerTimeDisplay, appConfig.serverTimeRefreshSeconds * 1000);
}


startApp();