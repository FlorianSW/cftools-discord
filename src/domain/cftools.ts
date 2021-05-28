export interface CFToolsServer {
    name: string,
    serverApiId: string,
    commandMapping: { [key: string]: string },
}

export class UnknownServer extends Error {
    constructor() {
        super('UnknownServer');
        Object.setPrototypeOf(this, UnknownServer.prototype);
    }
}

export class UnknownCommand extends Error {
    constructor() {
        super('UnknownCommand');
        Object.setPrototypeOf(this, UnknownCommand.prototype);
    }
}
