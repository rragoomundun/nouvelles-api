class ErrorResponse extends Error {
  constructor(message, statusCode, type = undefined) {
    this.message = message;
    this.statusCode = statusCode;

    if (type) {
      this.type = type;
    }
  }
}
