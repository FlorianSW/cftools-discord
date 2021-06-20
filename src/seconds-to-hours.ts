/**
 * Shamelessly "borrowed" from StackOverflow, user powtac:
 * https://stackoverflow.com/a/6313008/3394281
 */
export function secondsToHours(s: number) {
    let hours = Math.floor(s / 3600);
    let minutes = Math.floor((s - (hours * 3600)) / 60);
    let seconds = s - (hours * 3600) - (minutes * 60);

    let result = '';
    if (hours < 10) {
        result += '0';
    }
    result += hours + ':';
    if (minutes < 10) {
        result += '0';
    }
    result += minutes + ':';
    if (seconds < 10) {
        result += '0';
    }
    return result + seconds + 'h';
}
