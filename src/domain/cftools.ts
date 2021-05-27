export interface CFToolsServer {
    name: string,
    serverApiId: string,
    commandMapping: { [key: string]: string },
}

export class UnknownServer extends Error {
}

export class UnknownCommand extends Error {
}
