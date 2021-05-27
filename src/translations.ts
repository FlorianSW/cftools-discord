const messages: { [key: string]: string } = {
    NO_PRIORITY: 'You do not have priority queue for this server :disappointed_relieved:',
    PRIORITY_UNTIL: 'You have priority queue for this server, which will expire at: {{expires}} :partying_face:',

    STEAM_ID_UNKNOWN: 'The provided Steam ID is unknown.',
    ERROR_UNKNOWN: 'An unknown error occurred :woozy_face:',
};

interface TranslateOptions {
    params?: { [key: string]: string }
}

export function translate(key: string, options?: TranslateOptions): string {
    let message = messages[key];
    if (message === undefined) {
        return key;
    }
    if (options?.params !== undefined) {
        for (const param in options.params) {
            message = message.replace(`{{${param}}}`, options.params[param]);
        }
    }
    return message;
}
