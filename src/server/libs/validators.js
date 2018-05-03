import { check } from 'express-validator/check/validation-chain-builders';
import { User } from './database';

export function validateUserRole(role) {
  return check('user_uuid')
    .custom(async (uuid) => await User.findOne({ where: { uuid, role } }))
    .withMessage(`User does not exist or is not a ${role}.`);
}

export function validateUserExists() {
  return check('user_uuid')
    .custom(async (value) => await User.findById(value))
    .withMessage('User does not exist.');
}
