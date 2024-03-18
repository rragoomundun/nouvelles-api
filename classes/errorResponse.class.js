class ErrorResponse extends Error {
  constructor(message, statusCode, type = undefined) {
    super();

    this.message = message;
    this.statusCode = statusCode;

    if (type) {
      this.type = type;
    }
  }
}

export default ErrorResponse;
