const pageTitleElement = document.getElementById("pageTitle");
const pageItemsElement = document.getElementById("pageItems");
const pageIndicatorElement = document.getElementById("pageIndicator");
const serverTimeElement = document.getElementById("serverTime");

export function showPage(page, pageIndex, totalPages) {
  pageTitleElement.textContent = page.title;
  pageIndicatorElement.textContent = `Pagina ${pageIndex + 1} van ${totalPages}`;

  pageItemsElement.innerHTML = "";

  page.items.forEach(function (item) {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    pageItemsElement.appendChild(listItem);
  });
}

export function showServerTime(serverTime, appConfig) {
  const formattedServerTime = new Intl.DateTimeFormat(appConfig.displayLocale, {
    timeZone: appConfig.schoolTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23"
  }).format(serverTime);

  serverTimeElement.textContent = `Servertijd: ${formattedServerTime}`;
}

export function showServerTimeUnavailable() {
  serverTimeElement.textContent = "Servertijd niet beschikbaar";
}