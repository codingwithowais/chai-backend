const errorHandler = function(err , req , res, next){
    return res.status(err.statusCode || 500).json({
        statusCode: err.statusCode || 500,
        message: err.message || "internal server error",
        errors: err.errors || [],
        data: err.data || null
    })
}

export {errorHandler}