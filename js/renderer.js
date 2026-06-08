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

export function showServerTime(serverTime) {
  const formattedServerTime = serverTime.toLocaleTimeString("nl-BE", {
    hour: "2-digit",
    minute: "2-digit"
  });

  serverTimeElement.textContent = `Servertijd: ${formattedServerTime}`;
}

export function showServerTimeUnavailable() {
  serverTimeElement.textContent = "Servertijd niet beschikbaar";
}