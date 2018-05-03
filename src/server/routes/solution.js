import express from 'express';
import { verifyJWTMiddleware } from '../libs/middlewares';
import { Class, Solution, Task, User } from '../libs/database';
import { check, param, query } from 'express-validator/check';
import { matchedData } from 'express-validator/filter';
import { baseErrorHandler, DbError, errorAtValidation } from '../libs/utils';
import { validateUserExists, validateUserRole } from '../libs/validators';
import * as Op from 'sequelize';

const solution = express.Router();

solution.all('*', verifyJWTMiddleware);

const taskBelongsToStudent = async ({ user_uuid, taskId }) => {
  const task = await Task.findOne({
    where: { id: taskId, '$classes.Students.uuid$': user_uuid },
    include: [
      {
        model: Class,
        required: true,
        include: [{ model: User, as: 'Students' }],
      },
    ],
  });
  return !!task;
};

const getTasks = async ({ id, user_uuid, taskId }) => {
  let queryParams = { where: {}, group: 'taskId' };
  if (taskId) {
    const belongs = await taskBelongsToStudent({ user_uuid, taskId });
    if (belongs) {
      queryParams = { ...queryParams, where: { taskId } };
    } else {
      throw new DbError({ message: 'User has no access to this task!' });
    }
  }
  if (id) {
    const solution = await Solution.findOne({
      ...queryParams,
      where: { ...queryParams.where, id, userUuid: user_uuid },
    });
    const { id, value, status: status1, userUuid, taskId, createdAt } = solution;
    const task = await Task.findById(solution.taskId);
    const { name, description, status: status2, deadline, points } = task;
    return {
      ...{ id, value, status: status1, userUuid, taskId, createdAt },
      task: { name, description, status: status2, deadline, points },
    };
  } else {
    const options = {
      ...queryParams,
      where: { ...queryParams.where, userUuid: user_uuid },
    };
    const solutions = await Solution.findAll(options);
    const result = await Promise.all(
      solutions.map(async (solution) => {
        const { id, value, status: status1, userUuid, taskId, createdAt } = solution;
        const task = await Task.findById(solution.taskId);
        const { name, description, status: status2, deadline, points } = task;
        return {
          ...{ id, value, status: status1, userUuid, taskId, createdAt },
          task: { name, description, status: status2, deadline, points },
        };
      })
    );
    return result;
  }
};

solution.get(
  '/',
  [
    validateUserExists(),
    query('id').optional({ checkFalsy: true }),
    query('taskId').optional({ checkFalsy: true }),
    query('student').optional({ checkFalsy: true }),
  ],
  (req, res, next) => {
    if (errorAtValidation(req, res)) {
      return;
    }
    const { id, user_uuid, student, taskId } = matchedData(req);
    User.findOne({ where: { uuid: user_uuid } })
      .then((user) => {
        if (user.role === 'teacher') {
          getTasks({ id, user_uuid: student, taskId })
            .then((solution) => {
              return res.status(200).json(solution);
            })
            .catch(baseErrorHandler(res, next));
        } else {
          getTasks({ id, user_uuid, taskId })
            .then((solution) => res.status(200).json(solution))
            .catch(baseErrorHandler(res, next));
        }
      })
      .catch(baseErrorHandler(res, next));
  }
);

const createSolution = async ({ user_uuid, value, taskId }) => {
  if (taskBelongsToStudent({ user_uuid, taskId })) {
    return await Solution.create({ userUuid: user_uuid, value, taskId });
  } else {
    throw new DbError({ message: 'User has no access to this task!' });
  }
};

solution.post(
  '/',
  [
    validateUserRole('student'),
    check('value').exists(),
    check('taskId')
      .exists()
      .custom(async (value) => !!await Task.findOne({ where: { id: value } }))
      .withMessage('Task with id does not exist!'),
  ],
  (req, res, next) => {
    if (errorAtValidation(req, res)) {
      return;
    }
    const { user_uuid, value, taskId } = matchedData(req);
    createSolution({ user_uuid, value, taskId })
      .then((solution) => {
        if (!solution) {
          throw new DbError({ message: 'Solution not created' });
        }
        return res.status(200).json({ success: true });
      })
      .catch(baseErrorHandler(res, next));
  }
);

const taskBelongsToTeacher = async ({ user_uuid, taskId }) => {
  const tasks = await Task.findAll({ where: { CreatorUuid: user_uuid, id: taskId } });
  return !!tasks;
};

const updateSolution = async ({ user_uuid, id, solutionData }) => {
  const solution = await Solution.findById(id);
  if (!solution) throw new DbError({ message: 'Solution with given id not found!' });
  if (taskBelongsToTeacher({ user_uuid, taskId: solution.taskId })) {
    return await solution.update(solutionData);
  } else {
    throw new DbError({ message: 'The solution does not belong a task of the current user!' });
  }
};

solution.put(
  '/:id',
  [validateUserRole('teacher'), param('id').exists(), check('value').optional(), check('status').optional()],
  (req, res, next) => {
    if (errorAtValidation(req, res)) {
      return;
    }
    const { user_uuid, id, status, value } = matchedData(req);
    updateSolution({ id, user_uuid, solutionData: { status, value } })
      .then((solution) => {
        if (!solution) {
          throw new DbError({ message: 'Solution not updated' });
        }
        return res.status(200).json({ success: true });
      })
      .catch(baseErrorHandler(res, next));
  }
);

const deleteSolutionById = async ({ id, user_uuid: userUuid }) => {
  const solution = await Solution.findOne({ where: { id, userUuid } });
  if (!solution) throw new DbError({ message: 'Solution with given id not found!' });
  return await solution.destroy();
};

solution.delete(
  '/:id',
  [
    validateUserRole('teacher'),
    param('id')
      .exists()
      .withMessage('No solution id supplied!'),
  ],
  (req, res, next) => {
    if (errorAtValidation(req, res)) {
      return;
    }
    const { id, user_uuid } = matchedData(req);
    return deleteSolutionById({ id, user_uuid })
      .then(() => res.status(200).json({ success: true }))
      .catch(baseErrorHandler(res, next));
  }
);

export default solution;
