export class ServiceError extends Error {
    statusCode: number;
    code: string;
    details: any;

    constructor(statusCode: number, code: string, message: string, details: any = undefined) {
        {
            super(message);
            Object.setPrototypeOf(this, ServiceError.prototype);

            this.statusCode = statusCode;
            this.code = code;
            this.details = details;
        }
    }
}

export class InvalidBPReleaseFileError extends ServiceError {
    constructor() {
        super(400, 'InvalidBPReleaseFileError', 'Invalid BluePrism release file');
        Object.setPrototypeOf(this, InvalidBPReleaseFileError.prototype);
    }
}
