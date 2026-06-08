// Hardcoded page content for PoC
// Later to be replaced with content generated dynamically 
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

// Keeps track of which page is currently visible
let currentPageIndex = 0;

// Get the HTML elements that JavaScript needs to update
const pageTitleElement = document.getElementById("pageTitle");
const pageItemsElement = document.getElementById("pageItems");
const pageIndicatorElement = document.getElementById("pageIndicator");

function showPage(pageIndex) {
  const page = calendarPages[pageIndex];

  pageTitleElement.textContent = page.title;
  pageIndicatorElement.textContent = `Pagina ${pageIndex + 1} van ${calendarPages.length}`;

  pageItemsElement.innerHTML = "";

  page.items.forEach(function (item) {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    pageItemsElement.appendChild(listItem);
  });
}

function showNextPage() {
  currentPageIndex = currentPageIndex + 1;

  if (currentPageIndex >= calendarPages.length) {
    currentPageIndex = 0;
  }

  showPage(currentPageIndex);
}

// Show the first page immediately
showPage(currentPageIndex);

// Switch to the next page every 5 seconds
setInterval(showNextPage, 5000);