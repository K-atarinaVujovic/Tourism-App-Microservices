export function formatDate(date: string) {
    return new Date(date).toLocaleDateString("sr-RS");
}

export function calculateDuration(validFrom: string, validTo: string) {
    const from = new Date(validFrom);
    const to = new Date(validTo);

    const years = to.getFullYear() - from.getFullYear();

    if (years === 1) {
        return "1 year";
    }

    return `${years} years`;
}