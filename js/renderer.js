// Displays current page

const pageTitleElement = document.getElementById("pageTitle");
const pageItemsElement = document.getElementById("pageItems");
const pageIndicatorElement = document.getElementById("pageIndicator");

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

// Gets current time from the server

const serverTimeElement = document.getElementById("serverTime");

export function showServerTime(serverTime) {
  serverTimeElement.textContent = `Servertijd: ${serverTime.toLocaleTimeString("nl-BE")}`;
}

export function showServerTimeUnavailable() {
  serverTimeElement.textContent = "Servertijd niet beschikbaar";
}