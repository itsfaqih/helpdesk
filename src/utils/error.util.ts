export class UserError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class NotFoundError extends UserError {
  constructor(message?: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends UserError {
  constructor(message?: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends UserError {
  constructor(message?: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class BadRequestError extends UserError {
  constructor(message?: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export class InternalServerError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "InternalServerError";
  }
}

export class BadResponseError extends Error {
  constructor(message?: string) {
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
  }
}
