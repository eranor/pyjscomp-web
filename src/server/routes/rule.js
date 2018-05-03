import express from 'express';
import { Rule, Task, User } from '../libs/database';
import { verifyJWTMiddleware } from '../libs/middlewares';
import { validateUserExists, validateUserRole } from '../libs/validators';
import { body, check, param, query } from 'express-validator/check';
import { matchedData } from 'express-validator/filter';
import { baseErrorHandler, DbError, errorAtValidation } from '../libs/utils';

const rules = express.Router();

rules.all('*', verifyJWTMiddleware);

rules.get(
  '/:ruleId',
  [
    validateUserExists(),
    param('ruleId').optional({ checkFalsy: true }),
    query('taskId').optional({ checkFalsy: true }),
  ],
  (req, res, next) => {
    if (!errorAtValidation(req, res)) {
      const { user_uuid, ruleId, taskId } = matchedData(req);
      User.findById(user_uuid).then((user) => {
        if (!user) throw new DbError({ message: 'User with id does not exists!' });
        if (user.role === 'student') {
          if (taskId) {
            return Task.findById(taskId)
              .then((task) => {
                if (!task) throw new DbError({ message: 'Task with id does not exists!' });
                task.getRules().then((rules) => {
                  res.status(200).json(rules);
                });
              })
              .catch(baseErrorHandler(res, next));
          }
        } else {
          if (taskId) {
            return Task.findById(taskId)
              .then((task) => {
                if (!task) throw new DbError({ message: 'Task with id does not exists!' });
                task.getRules().then((rules) => {
                  res.status(200).json(rules);
                });
              })
              .catch(baseErrorHandler(res, next));
          } else {
            Rule.findAll({ where: { userUuid: user_uuid, id: ruleId } })
              .then((rules) => res.status(200).json(rules))
              .catch(baseErrorHandler(res, next));
          }
        }
      });
    }
  }
);

rules.post(
  '/',
  [validateUserRole('teacher'), body('name').exists(), body('description').optional(), body('value').exists()],
  (req, res, next) => {
    if (!errorAtValidation(req, res)) {
      const { name, description, user_uuid, value } = matchedData(req);
      return Rule.create({ name, description, userUuid: user_uuid, value })
        .then(() => res.status(201).json({ message: 'Rule created' }))
        .catch(baseErrorHandler(res, next));
    }
  }
);

rules.put(
  '/:id',
  [
    validateUserRole('teacher'),
    check('id').exists(),
    body('name').optional(),
    body('description').optional(),
    body('value').optional(),
  ],
  (req, res, next) => {
    if (!errorAtValidation(req, res)) {
      const { id, name, description, user_uuid, value } = matchedData(req);
      Rule.findOne({ where: { id, userUuid: user_uuid } })
        .then((rule) => {
          if (!rule) throw new DbError('Rule with id does not exists or user has no access.');
          rule.update({ name, description, userUuid: user_uuid, value }).then((rule2) => res.status(200).json(rule2));
        })
        .catch(baseErrorHandler(res, next));
    }
  }
);

rules.delete('/:id', [validateUserRole('teacher'), check('id').exists()], (req, res, next) => {
  if (!errorAtValidation(req, res)) {
    const { id, user_uuid } = matchedData(req);
    Rule.findOne({ where: { id, userUuid: user_uuid } })
      .then((rule) => {
        if (!rule) throw new DbError('Rule with id does not exists or user has no access.');
        rule.destroy().then(() => res.status(200).json({ message: 'Rule deleted' }));
      })
      .catch(baseErrorHandler(res, next));
  }
});

const assignRuleToTask = async ({ user_uuid, taskId, ruleId }) => {
  const task = await Task.findOne({ where: { id: taskId, CreatorUuid: user_uuid } });
  if (!task) throw new DbError({ message: 'Task with given id not found!' });
  const rule = await Rule.findOne({ where: { id: ruleId, userUuid: user_uuid } });
  if (!rule) throw new DbError({ message: 'Rule with given id not found!' });
  return await task.addRule(rule);
};

rules.post(
  '/assign-to-task',
  [validateUserRole('teacher'), body('taskId').exists(), body('ruleId').exists()],
  (req, res, next) => {
    if (!errorAtValidation(req, res)) {
      const { user_uuid, taskId, ruleId } = matchedData(req);
      return assignRuleToTask({ user_uuid, taskId, ruleId })
        .then((result) => {
          if (result && result.length > 0) {
            return res.status(200).json({ success: true });
          }
          throw new DbError({ statusCode: 409, message: 'Task already assigned to class.' });
        })
        .catch(baseErrorHandler(res, next));
    }
  }
);

export default rules;
