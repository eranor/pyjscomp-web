import { verifyJWTToken } from './auth';
import { logger } from './logging';

export function verifyJWTMiddleware(req, res, next) {
  verifyJWTToken(req.token)
    .then((decodedToken) => {
      req.body = { ...req.body, user_uuid: decodedToken.data };
      next();
    })
    .catch((err) => {
      logger.log({ level: 'error', message: 'Invalid auth token provided.', error: err });
      return res.status(400).json({ message: 'Invalid auth token provided.' });
    });
}
