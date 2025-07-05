class ApiError extends Error{
    constructor(statusCode , message = "Some error occured" , errors = []){
        super(message);
        this.statusCode = statusCode;
        this.message = message,
        this.errors = errors,
        this.data = null
    }
}

export {ApiError}