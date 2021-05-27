export interface CFToolsServer {
    name: string,
    serverApiId: string,
    availableCommands: string[],
}

export class UnknownServer extends Error {
}

export class UnknownCommand extends Error {
}
