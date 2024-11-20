import {isHexColor} from "../src/utils/dualColor.js";

describe("isHexColor", {}, () => {
    it("should return true for valid hex colors", () => {
        expect(isHexColor("#000000")).toBe(true);
        expect(isHexColor("#FFFFFF")).toBe(true);
        expect(isHexColor("#00000000")).toBe(true);
        expect(isHexColor("#FFFFFF00")).toBe(true);
        expect(isHexColor("#000")).toBe(true);
        expect(isHexColor("#FFF")).toBe(true);
        expect(isHexColor("#fff")).toBe(true);
    });

    it("should return false for invalid hex colors", () => {
        expect(isHexColor("random string")).toBe(false);
        expect(isHexColor("FFFFFF")).toBe(false);
        expect(isHexColor("#FFFFFFFFFFFF0")).toBe(false);
    });
});
