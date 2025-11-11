// ✅ Global variable injected by OneTrust
declare const OptanonActiveGroups: string;

// ✅ DO NOT declare "Onetrust" — OneTrust uses capital T
// If you declare it, TS will think it's a different variable and fail.
declare const Optanon: object;

// ✅ Define the type you want
type ActiveCookies = string[];

