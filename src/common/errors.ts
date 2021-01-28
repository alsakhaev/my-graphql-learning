export class AuthError extends Error {
    constructor() {
        super("Invalid account key.");
        this.name = "AuthError";
    }
}