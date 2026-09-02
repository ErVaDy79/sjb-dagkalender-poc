export const MIN_CALENDAR_YEAR = 2000;
export const MAX_CALENDAR_YEAR = 2099;
export const DATE_PARAMETER_FORMAT = "YYYY-MM-DD";
export const CALENDAR_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const CALENDAR_COLUMNS = Object.freeze([
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I"
]);

export const CALENDAR_WEEKDAY_CODES = Object.freeze([
    "ZO",
    "MA",
    "DI",
    "WO",
    "DO",
    "VR",
    "ZA"
]);

export const CALENDAR_WEEKDAY_NAMES = Object.freeze([
    "zondag",
    "maandag",
    "dinsdag",
    "woensdag",
    "donderdag",
    "vrijdag",
    "zaterdag"
]);

export const CALENDAR_MONTH_NAMES = Object.freeze([
    "januari",
    "februari",
    "maart",
    "april",
    "mei",
    "juni",
    "juli",
    "augustus",
    "september",
    "oktober",
    "november",
    "december"
]);

export const CALENDAR_FILENAME_SEPARATOR = "_";
export const CALENDAR_FILENAME_EXTENSION = ".json";

export const ANNOUNCEMENTS_TITLE = "Mededelingen";
export const EMPTY_CONTENT_TEXT = "[Geen info]";
export const CALENDAR_STATUS_TEXT = Object.freeze({
    loading: "Kalender wordt geladen…",
    notFound: "Geen kalender gevonden voor {date}.",
    invalidDate: "De datum in de URL is ongeldig.",
    network: "De kalender kon niet worden geladen. Controleer de verbinding.",
    http: "De kalender kon niet worden geladen (HTTP-fout {status}).",
    invalidJson: "Het kalenderbestand is corrupt en kan niet worden geladen.",
    invalidStructure: (
        "Het kalenderbestand heeft een ongeldige structuur "
        + "en kan niet worden geladen."
    ),
    unexpected: "Er is een onverwachte fout opgetreden."
});
export const PAUSE_BLOCK_LABELS = Object.freeze([
    "P1",
    "MP",
    "P2"
]);

export const MIN_CALENDAR_COLUMN_WIDTH = 1;
export const COLUMN_BALANCE_WEIGHTS = Object.freeze({
    header: 1,
    emptyMessage: 1,
    spacing: 0.5
});
export const COLUMN_BALANCE_TIE_BREAKER = "earlier";

export const MIN_CALENDAR_SCALE = 0.1;
export const MAX_CALENDAR_SCALE = 8;
export const CALENDAR_SCALE_PRECISION = 0.01;
