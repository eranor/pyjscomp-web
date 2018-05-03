import express from 'express';
import { Class, Task, Solution } from '../libs/database';
import { verifyJWTMiddleware } from '../libs/middlewares';
import { check, param, query, body, validationResult } from 'express-validator/check';
import { matchedData } from 'express-validator/filter';
import { baseErrorHandler, DbError, errorAtValidation } from '../libs/utils';
import { validateUserRole } from '../libs/validators';

const tasks = express.Router();

tasks.all('*', verifyJWTMiddleware);

tasks.get('/', [validateUserRole('teacher'), query('id').optional()], (req, res, next) => {
  if (errorAtValidation(req, res)) {
    return;
  }
  const { id, user_uuid } = matchedData(req);
  if (id) {
    return Task.findOne({ where: { id, CreatorUuid: user_uuid } })
      .then((task) => res.status(200).json(task))
      .catch(baseErrorHandler(res, next));
  } else {
    return Task.findAndCountAll({ where: { CreatorUuid: user_uuid } })
      .then((tasks) => res.status(200).json(tasks))
      .catch(baseErrorHandler(res, next));
  }
});

tasks.post(
  '/',
  [
    validateUserRole('teacher'),
    check('name').exists(),
    check('description').optional(),
    check('status').optional(),
    check('deadline').optional(),
    check('points').optional(),
    check('parentId').optional(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (errorAtValidation(req, res)) {
      return;
    }
    const { user_uuid, name, description, status, deadline, points, parentId } = matchedData(req);
    const data = {
      name,
      description,
      status,
      deadline,
      points,
      CreatorUuid: user_uuid,
      parentId,
    };

    Task.create(data)
      .then((task) => {
        if (!task) {
          throw new DbError({ message: 'Task not created' });
        }
        return res.status(200).json({ success: true });
      })
      .catch(baseErrorHandler(res, next));
  }
);

const updateTask = async ({ id, taskData }) => {
  const task = await Task.findById(id);
  if (!task) throw new DbError({ message: 'Task with given id not found!' });
  return await task.update(taskData);
};

tasks.put(
  '/:id',
  [
    validateUserRole('teacher'),
    param('id').exists(),
    check('name').optional(),
    check('description').optional(),
    check('status').optional(),
    check('deadline').optional(),
    check('points').optional(),
    check('parentId').optional(),
  ],
  (req, res, next) => {
    if (errorAtValidation(req, res)) {
      return;
    }
    const { id, name, description, status, deadline, points, parentId } = matchedData(req);
    const taskData = { name, description, status, deadline, points, parentId };
    updateTask({ id, taskData })
      .then((task) => {
        if (!task) {
          throw new DbError({ message: 'Task not updated' });
        }
        return res.status(200).json({ success: true });
      })
      .catch(baseErrorHandler(res, next));
  }
);

const deleteTaskById = async ({ id, user_uuid: CreatorUuid }) => {
  const task = await Task.findOne({ where: { id, CreatorUuid } });
  if (!task) throw new DbError({ message: 'Task with given id not found!' });
  const solutions = await Solution.findAll({ where: { taskId: id } });
  solutions.forEach((it) => {
    it.destroy();
  });
  return await task.destroy();
};

tasks.delete(
  '/:id',
  [
    validateUserRole('teacher'),
    param('id')
      .exists()
      .withMessage('No task id supplied!'),
  ],
  (req, res, next) => {
    if (errorAtValidation(req, res)) {
      return;
    }
    const { id, user_uuid } = matchedData(req);
    return deleteTaskById({ id, user_uuid })
      .then(() => res.status(200).json({ success: true }))
      .catch(baseErrorHandler(res, next));
  }
);

const assignTaskToClass = async ({ user_uuid, taskId, classId }) => {
  const task = await Task.findOne({ where: { id: taskId, CreatorUuid: user_uuid } });
  if (!task) throw new DbError({ message: 'Task with given id not found!' });
  const cls = await Class.findOne({ where: { id: classId, TeacherUuid: user_uuid } });
  if (!cls) throw new DbError({ message: 'Class with given id not found!' });
  return await task.addClass(cls);
};

tasks.post(
  '/assign-to-class',
  [validateUserRole('teacher'), check('taskId').exists(), check('classId').exists()],
  (req, res, next) => {
    if (errorAtValidation(req, res)) {
      return;
    }
    const { user_uuid, taskId, classId } = matchedData(req);
    return assignTaskToClass({ user_uuid, taskId, classId })
      .then((result) => {
        if (result && result.length > 0) {
          return res.status(200).json({ success: true });
        }
        throw new DbError({ statusCode: 409, message: 'Task already assigned to class.' });
      })
      .catch(baseErrorHandler(res, next));
  }
);

const getTaskRules = async ({ taskId, user_uuid }) => {
  const task = await Task.findOne({ where: { id: taskId, CreatorUuid: user_uuid } });
  if (!task) throw new DbError({ message: 'Task with id does not exists or user has no access!' });
  return await task.getRules();
};

tasks.post('/rules', [validateUserRole('teacher'), body('taskId').exists()], (req, res, next) => {
  if (!errorAtValidation(req, res)) {
    const { user_uuid, taskId } = matchedData(req);
    return getTaskRules({ user_uuid, taskId })
      .then((result) => res.status(200).json(result))
      .catch(baseErrorHandler(res, next));
  }
});

export default tasks;
