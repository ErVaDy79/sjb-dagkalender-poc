import { convertTimeTextToMinutes } from "./time.js";

export function createCalendarPages(schoolHours) {
  const pages = [
    {
      title: "Algemene informatie",
      items: [
        "Algemene informatie"
      ],
      alwaysDisplay: true,
      displayPage: true
    }
  ];

  schoolHours.forEach(function (schoolHour) {
    pages.push({
      title: schoolHour.code,
      items: [
        `Info lesuur ${schoolHour.code.replace("L", "")}`
      ],
      startTime: schoolHour.startTime,
      endTime: schoolHour.endTime,
      alwaysDisplay: false,
      displayPage: true
    });
  });

  return pages;
}

export function updateDisplayPageFlags(calendarPages, currentMinutesSinceMidnight) {
  calendarPages.forEach(function (page) {
    if (page.alwaysDisplay === true) {
      page.displayPage = true;
      return;
    }

    const pageEndMinutes = convertTimeTextToMinutes(page.endTime);

    page.displayPage = currentMinutesSinceMidnight <= pageEndMinutes;
  });
}

export function markAllPagesAsDisplayable(calendarPages) {
  calendarPages.forEach(function (page) {
    page.displayPage = true;
  });
}

export function getDisplayablePages(calendarPages) {
  return calendarPages.filter(function (page) {
    return page.displayPage === true;
  });
}