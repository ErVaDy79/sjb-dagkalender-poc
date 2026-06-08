export async function getCurrentServerTime() {
  const response = await fetch(window.location.href, {
    method: "HEAD",
    cache: "no-store"
  });

  const serverDateHeader = response.headers.get("Date");

  if (serverDateHeader === null) {
    throw new Error("Server did not return a Date header.");
  }

  return new Date(serverDateHeader);
}

export function getMinutesSinceMidnight(date, appConfig) {
  const formatter = new Intl.DateTimeFormat(appConfig.displayLocale, {
    timeZone: appConfig.schoolTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23"
  });

  const timeParts = formatter.formatToParts(date);

  const hourPart = timeParts.find(function (part) {
    return part.type === "hour";
  });

  const minutePart = timeParts.find(function (part) {
    return part.type === "minute";
  });

  return Number(hourPart.value) * 60 + Number(minutePart.value);
}

export function convertTimeTextToMinutes(timeText) {
  const timeParts = timeText.split(":");

  const hours = Number(timeParts[0]);
  const minutes = Number(timeParts[1]);

  return hours * 60 + minutes;
}