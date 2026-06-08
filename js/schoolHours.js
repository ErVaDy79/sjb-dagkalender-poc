export async function loadSchoolHours() {
  const response = await fetch("config/school-hours.json", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Could not load school hours.");
  }

  return await response.json();
}