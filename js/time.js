// Gets the current time from the webserver response header.
// This avoids relying directly on the signage device's local system clock.
//
// Browser JavaScript cannot directly query an NTP server.
// For this frontend-only PoC, we use the HTTP "Date" header from the webserver.

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