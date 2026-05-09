export class Result {
    constructor({
        message = "",
        isError = false,
        errorCode = null,
        value = null,
        isValueExists = false
    } = {}) {
        this.Message = message;
        this.IsError = isError;
        this.ErrorCode = errorCode;
        this.Value = value;
        this.IsValueExists = isValueExists;
    }

    static success(value = null, message = "OK") {
        return new Result({
            message,
            value,
            isValueExists: value !== null
        });
    }

    static error(message = "Error", errorCode = "UNKNOWN") {
        return new Result({
            message,
            isError: true,
            errorCode
        });
    }
}