"use strict";
function normalizeToArray(input) {
    if (!input)
        return [];
    if (typeof input === 'string') {
        try {
            const parsed = JSON.parse(input);
            return Array.isArray(parsed) ? parsed : [parsed];
        }
        catch {
            return input.split(',').map((item) => item.trim());
        }
    }
    return input;
}
