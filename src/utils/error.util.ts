export class BaseResponseError extends Error {
  code?: number;

  constructor(message?: string) {
    super(message);
  }
}
export class UserError extends BaseResponseError {
  constructor(message?: string) {
    super(message);
  }
}

export class NotFoundError extends UserError {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
    this.code = 404;
  }
}

export class ForbiddenError extends UserError {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
    this.code = 403;
  }
}

export class UnauthorizedError extends UserError {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
    this.code = 401;
  }
}

export class BadRequestError extends UserError {
  constructor(message = "Bad request") {
    super(message);
    this.name = "BadRequestError";
    this.code = 400;
  }
}

export class InternalServerError extends BaseResponseError {
  constructor(message = "Internal server error") {
    super(message);
    this.name = "InternalServerError";
    this.code = 500;
  }
}

export class BadResponseError extends Error {
  constructor(message = "Bad response") {
    super(message);
    this.name = "BadResponseError";
  }
}

export class FetchError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "FetchError";
  }
}

export class ConflictError extends UserError {
  constructor(message?: string) {
    super(message);
    this.name = "ConflictError";
    this.code = 409;
  }
}
