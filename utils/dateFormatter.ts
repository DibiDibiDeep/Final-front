export function formatDate(date: Date): string {
    return date.toLocaleDateString(process.env.DATE_FORMAT, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).replace(/. /g, '.').replace(/.$/, '');
}