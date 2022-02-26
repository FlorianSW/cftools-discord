export interface CFToolsServer {
    name: string,
    serverApiId: string,
    connect: {
        ip: string,
        port: number,
    },
    commands: { [command: string]: CommandConfig },
}

export type CommandConfig = {
    [key: string]: any,
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

export class CommandNotAllowed extends Error {
    constructor() {
        super('CommandNotAllowed');
        Object.setPrototypeOf(this, CommandNotAllowed.prototype);
    }
}

export class UsageError extends Error {
    constructor(public readonly message: string) {
        super('UsageError');
        Object.setPrototypeOf(this, UsageError.prototype);
    }
}
