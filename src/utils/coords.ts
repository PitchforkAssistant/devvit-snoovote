export type Coords = {
    x: number;
    y: number;
    z: number;
};

export type Area = {
    min: Coords;
    max: Coords;
}

export function isCoords (object: unknown): object is Coords {
    if (!object || typeof object !== "object") {
        return false;
    }
    const coords = object as Coords;
    return typeof coords.x === "number" &&
           typeof coords.y === "number" &&
           typeof coords.z === "number";
}

export function equalCoords (a: Coords, b: Coords): boolean {
    return a.x === b.x && a.y === b.y && a.z === b.z;
}
