import express from 'express';
import { verifyJWTMiddleware } from '../libs/middlewares';
import { Class, Rule, Task, User } from '../libs/database';
import { compareSync, hashSync } from 'bcryptjs';
import { body, check, query } from 'express-validator/check';
import { matchedData } from 'express-validator/filter';
import { baseErrorHandler, DbError, errorAtValidation, ValidationError } from '../libs/utils';
import { validateUserExists, validateUserRole } from '../libs/validators';
import * as Op from 'sequelize';

const users = express.Router();

users.all('*', verifyJWTMiddleware);

const updateUserData = async ({ user_uuid, userData }) => {
  const user = await User.findById(user_uuid);
  if (!user) {
    throw new DbError({ message: 'User with given id not found!' });
  }
  return await user.update(userData);
};

users.post(
  '/',
  [
    validateUserExists(),
    body('firstName')
      .isLength({ min: 1, max: 100 })
      .optional({ checkFalsy: true }),
    body('lastName')
      .isLength({ min: 1, max: 100 })
      .optional({ checkFalsy: true }),
    body('email')
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage('Must be a valid email')
      .trim()
      .normalizeEmail()
      .custom(async (value) => !await User.findOne({ where: { email: { [Op.eq]: value } } }))
      .withMessage('This email is already in use'),
  ],
  (req, res, next) => {
    if (!errorAtValidation(req, res)) {
      const { user_uuid, firstName, lastName, email } = matchedData(req);
      updateUserData({ user_uuid, userData: { firstName, lastName, email } })
        .then(() => res.status(200).json({ success: true }))
        .catch(baseErrorHandler(res, next));
    }
  }
);

users.post(
  '/change-password',
  [
    validateUserExists(),
    body('oldPassword').exists(),
    body('newPassword', 'Passwords must be at least 8 chars long and contain one number')
      .exists()
      .isLength({ min: 8, max: 64 })
      .matches(/\d/),
  ],
  (req, res, next) => {
    if (!errorAtValidation(req, res)) {
      const { user_uuid, oldPassword, newPassword } = matchedData(req);
      if (oldPassword === newPassword) {
        throw new ValidationError({ message: 'The new password cannot be the same as the old!' });
      }
      updateUserData({ user_uuid, userData: { password: hashSync(newPassword, 8) } })
        .then(() => res.status(200).json({ success: true }))
        .catch(baseErrorHandler(res, next));
    }
  }
);

const deleteAccountByUuid = async ({ user_uuid, password }) => {
  const user = await User.findById(user_uuid);
  if (!user) throw new DbError({ message: 'User with given id not found!' });
  if (!compareSync(password, user.password)) {
    throw new ValidationError({ message: 'Invalid password used!' });
  }
  return await user.destroy();
};

users.post('/delete-account', [validateUserExists(), body('password').exists()], (req, res, next) => {
  if (!errorAtValidation(req, res)) {
    const { user_uuid, password } = matchedData(req);
    deleteAccountByUuid({ user_uuid, password })
      .then(() => res.status(200).json({ success: true }))
      .catch(baseErrorHandler(res, next));
  }
});

users.get('/rules', [validateUserRole('teacher')], (req, res, next) =>
  Rule.findAll({ where: { userId: req.params.user_id }, include: { model: RuleParameter } })
    .then((rules) => {
      if (!rules) return res.status(404).json({ Error: 'Rule for the given user id not found' });
      return res.json(rules);
    })
    .catch(baseErrorHandler(res, next))
);

const getClassesForStudent = async (user_uuid) => {
  const user = await User.findById(user_uuid);
  if (!user) throw new DbError({ message: 'User with the given id not found' });
  const classes = await user.getClasses();
  return await Promise.all(
    classes.map(async (cls) => {
      const { id, name } = cls;
      const students = (await cls.getStudents()).map((it) => it.getFullname());
      const { firstName, lastName } = await cls.getTeacher();
      return { id, name, students, teacher: { firstName, lastName } };
    })
  );
};

users.get('/classes', [validateUserRole('student')], (req, res, next) => {
  if (!errorAtValidation(req, res)) {
    const { user_uuid } = matchedData(req);
    getClassesForStudent(user_uuid)
      .then((result) => {
        return res.status(200).json(result);
      })
      .catch(baseErrorHandler(res, next));
  }
});

users.post('/rules', [validateUserRole('teacher')], (req, res, next) => {
  if (!req.body || !req.body.rule || !req.body.params) return res.sendStatus(400);
  return Rule.create(req.body.rule)
    .then(() => {})
    .catch(baseErrorHandler(res, next));
});

const addStudentToClass = async (user_uuid, id, password) => {
  const user = await User.findById(user_uuid);
  if (!user) throw new DbError({ message: 'User with the given id not found' });
  const cls = await Class.findOne({ where: { id, password } });
  if (!cls) throw new DbError({ message: 'Wrong id or password' });
  return await cls.addStudent(user);
};

users.post(
  '/add-to-class',
  [validateUserRole('student'), check('id').exists(), check('password').exists()],
  (req, res, next) => {
    if (errorAtValidation(req, res)) {
      return;
    }
    const { id, password, user_uuid } = matchedData(req);
    return addStudentToClass(user_uuid, id, password)
      .then((result) => {
        if (result && result.length > 0) {
          return res.status(200).json({ success: true });
        }
        throw new DbError({ statusCode: 409, message: 'Student already in class' });
      })
      .catch(baseErrorHandler(res, next));
  }
);

const getTasksForUser = async ({ taskId, user_uuid }) => {
  let tasks = [];
  const include = [
    {
      model: Class,
      required: true,
      include: [{ model: User, as: 'Students', where: { uuid: user_uuid } }],
    },
  ];
  if (taskId) {
    tasks = await Task.findOne({ where: { id: taskId }, include });
    if (!tasks) {
      throw new DbError({ message: 'Task with the given id not found' });
    }
    const { dataValues: { classes, CreatorUuid, ...rest } } = tasks;
    return rest;
  } else {
    tasks = await Task.findAll({ include });
    if (!tasks) {
      throw new DbError({ message: 'Task with the given id not found' });
    }
    return tasks.map(({ dataValues: { classes, CreatorUuid, ...rest } }) => rest);
  }
};

users.get('/tasks', [validateUserExists(), query('taskId').optional()], (req, res, next) => {
  if (errorAtValidation(req, res)) {
    const { taskId, user_uuid } = matchedData(req);
    getTasksForUser({ taskId, user_uuid })
      .then((result) => res.status(200).json(result))
      .catch(baseErrorHandler(res, next));
  }
});

export default users;
