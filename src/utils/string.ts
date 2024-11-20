export function camelCase (strings: string[]): string {
    return strings.map((string, index) => {
        if (index === 0) {
            return string;
        }
        if (!string) {
            return "";
        }
        return string[0].toUpperCase() + string.slice(1);
    }).join("");
}
