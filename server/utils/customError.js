class CustomError extends Error {
  constructor(statusCode, message) {
    super(message); // Call the parent Error constructor
    this.statusCode = statusCode;
    this.isOperational = true;

    // Capture the stack trace (optional, for debugging)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

module.exports = CustomError;
