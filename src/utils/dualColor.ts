import {Devvit} from "@devvit/public-api";

export type DualColor = {
    dark: string;
    light: string;
};

export function isDualColor (object: unknown): object is DualColor {
    if (!object || typeof object !== "object") {
        return false;
    }
    const color = object as DualColor;
    return typeof color.dark === "string" && typeof color.light === "string";
}

export function getDualColor (color: DualColor, theme: string): Devvit.Blocks.ColorString {
    return theme === "dark" ? color.dark : color.light;
}

export function isHexColor (color: string): boolean {
    return /^#[0-9A-F]{3}([0-9A-F]{3}|[0-9A-F]{5})?$/i.test(color);
}
