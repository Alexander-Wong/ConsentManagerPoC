import { CookieType } from "./CookieType.js";

export class CookieCategory {
    cookies: CookieType[];
    cookieNames: string[];
    code?: string;
    src?: string;
    defer?: CookieCategory[];
    constructor(cookies: CookieType[], cookieNames: string[] , code?: string, src?: string, defer?: CookieCategory[]) {
        this.cookies = cookies;
        this.cookieNames = cookieNames;
        this.code = code;
        this.src = src;
        this.defer = defer;
    }
}