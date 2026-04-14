const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    //Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 404;
        message = 'Resource not found';
    }

    // MongoDB duplicate key (code 11000; err.name is usually 'MongoServerError')
    if (err.code === 11000) {
        statusCode = 409;
        if (err.keyValue && typeof err.keyValue === "object") {
            const field = Object.keys(err.keyValue)[0];
            message = field ? `${field} already exists` : "Duplicate entry";
        } else {
            message = "Duplicate entry";
        }
    }

    //Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }
    
    //Multer file size error
    if(err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        const maxBytes = Number.parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760; // 10MB default (must match multer)
        const mb = maxBytes / (1024 * 1024);
        const mbText = Number.isFinite(mb)
            ? (Number.isInteger(mb) ? `${mb}` : mb.toFixed(1).replace(/\.0$/, ""))
            : "10";
        message = `File size is too large. Maximum limit is ${mbText}MB`;
    }

    //JWT authentication error
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if(err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired';
    }


    console.error("Error: ", {
        message: err.message,
        stack:process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    res.status(statusCode).json({
       success: false,
       error: message,
       statusCode,
       ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;