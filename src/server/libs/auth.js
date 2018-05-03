import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export function verifyJWTToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err || !decodedToken) {
        return reject(err);
      }
      resolve(decodedToken);
    });
  });
}

export function createJWToken(data) {
  return jwt.sign({ data }, JWT_SECRET, {
    expiresIn: 86400,
    algorithm: 'HS256',
  });
}
