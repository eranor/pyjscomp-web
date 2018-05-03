import { logger } from './logging';
import { validationResult } from 'express-validator/check';

export class DbError extends Error {
  constructor({ statusCode = 422, message }) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, DbError);
  }
}

export class ValidationError extends Error {
  constructor({ statusCode = 422, message }) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, ValidationError);
  }
}

export const errorAtValidation = (req, res, status = 422) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.log({ level: 'error', message: 'ValidationError', error: errors.mapped() });
    res.status(status).json({ errors: errors.mapped() });
    return true;
  } else {
    return false;
  }
};

export const emptyResultHandler = (res, next) => (error) => {};

export const baseErrorHandler = (res, next) => (error) => {
  if (error instanceof DbError) {
    logger.log({ level: 'error', message: 'DbError', error });
    res.status(error.statusCode).json({ message: error.message });
  } else if (error instanceof ValidationError) {
    logger.log({ level: 'error', message: 'ValidationError', error });
    res.status(error.statusCode).json({ errors: [{ msg: error.message }] });
  } else {
    return next(error);
  }
};

export function uuidV4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
