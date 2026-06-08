// Loads configuration for app from the config file

export async function loadAppConfig() {
  const response = await fetch("config/app-config.json", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Could not load app config.");
  }

  return await response.json();
}