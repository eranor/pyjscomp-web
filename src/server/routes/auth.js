import express from 'express';
import { compareSync, hashSync } from 'bcryptjs';
import { TeacherCode, User } from '../libs/database';
import { check, query } from 'express-validator/check';
import { matchedData } from 'express-validator/filter';
import { createJWToken } from '../libs/auth';
import { baseErrorHandler, errorAtValidation } from '../libs/utils';
import * as Op from 'sequelize/lib/operators';

const auth = express.Router();

auth.post(
  '/sign_up',
  [
    check('email')
      .isEmail()
      .withMessage('Must be a valid email')
      .trim()
      .normalizeEmail()
      .custom(async (value) => !await User.findOne({ where: { email: { [Op.eq]: value } } }))
      .withMessage('This email is already in use'),
    check('firstName')
      .exists()
      .isLength({ min: 1, max: 100 }),
    check('lastName')
      .exists()
      .isLength({ min: 1, max: 100 }),
    check('password', 'Passwords must be at least 8 chars long and contain one number')
      .exists()
      .isLength({ min: 8, max: 64 })
      .matches(/\d/),
    check('role')
      .exists()
      .custom((value) => ['student', 'teacher'].includes(value)),
  ],
  (req, res, next) => {
    if (errorAtValidation(req, res)) {
      return;
    }
    const { password, ...rest } = matchedData(req);
    User.create({ ...rest, password: hashSync(password, 8) })
      .then((user) => {
        const { uuid, firstName: firstName, lastName: lastName, email, role } = user;
        return { uuid, firstName, lastName, email, role };
      })
      .then((user) => {
        res.status(200).json({
          user,
          token: createJWToken(user.uuid),
        });
      })
      .catch((error) => next(error));
  }
);

auth.post(
  '/login',
  [
    check('email')
      .exists()
      .isEmail()
      .withMessage('Must be a valid email')
      .trim()
      .normalizeEmail(),
    check('password').exists(),
  ],
  (req, res, next) => {
    if (!errorAtValidation(req, res)) {
      const { email, password } = matchedData(req);
      User.findOne({ where: { email: { [Op.eq]: email } } })
        .then((user) => {
          if (!user) {
            return res.status(422).json({ errors: [{ msg: 'User with the given email address not found.' }] });
          }
          const isValid = compareSync(password, user.password);
          if (!isValid) {
            return res.status(422).json({ errors: [{ msg: 'Unknown user or wrong password.' }] });
          }
          const { uuid, firstName: firstName, lastName: lastName, email, role } = user;
          res.status(200).json({
            user: { uuid, firstName, lastName, email, role },
            token: createJWToken(uuid),
          });
        })
        .catch(baseErrorHandler(res, next));
    }
  }
);

auth.get(
  '/validate_code',
  [
    query('code', 'The given code is invalid!')
      .exists()
      .custom(async (value) => await TeacherCode.findOne({ where: { code: { [Op.eq]: value } } })),
  ],
  (req, res, next) => {
    if (!errorAtValidation(req, res)) {
      res.status(200).send();
    }
  }
);

auth.get(
  '/user_exists',
  [
    query('email')
      .exists()
      .withMessage('Query parameter email is required!')
      .isEmail()
      .withMessage('Must be a valid email!')
      .trim()
      .normalizeEmail()
      .custom(async (value) => !await User.findOne({ where: { email: { [Op.eq]: value } } }))
      .withMessage('User exists under the given email address.'),
  ],
  (req, res, next) => {
    if (!errorAtValidation(req, res)) {
      res.status(200).send();
    }
  }
);

export default auth;
