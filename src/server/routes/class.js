import express from 'express';
import { check, param, query, body } from 'express-validator/check';
import { verifyJWTMiddleware } from '../libs/middlewares';
import { Class, User, Task } from '../libs/database';
import { matchedData } from 'express-validator/filter';
import { baseErrorHandler, DbError, errorAtValidation } from '../libs/utils';
import { validateUserExists, validateUserRole } from '../libs/validators';
import { EmptyResultError } from 'sequelize';
import solution from './solution';
import users from './user';

const classes = express.Router();

classes.all('*', verifyJWTMiddleware);

const getClassesForUser = async ({ user_uuid, id }) => {
  const isTeacher = await User.findOne({ where: { uuid: user_uuid, role: 'teacher' } });
  let whereParams;
  if (id) {
    whereParams = { id };
  }
  if (isTeacher) {
    const classResult = await Class.findAll({
      where: { TeacherUuid: user_uuid, ...whereParams },
      include: [
        { model: User, as: 'Teacher' },
        { model: User, as: 'Students', where: { role: 'student' }, required: false },
      ],
    });
    const result = {
      teacher: isTeacher,
      result: classResult,
    };
    return result;
  } else {
    return { teacher: isTeacher, result: await Class.findAll({}) };
  }
};

// Get classes for user
classes.get('/', [validateUserExists(), query('id').optional()], (req, res, next) => {
  if (errorAtValidation(req, res, 401)) {
    return;
  }
  const { user_uuid, id } = matchedData(req);
  getClassesForUser({ user_uuid, id })
    .then(({ teacher, result }) => {
      if (teacher) {
        res.status(200).json(result);
      } else {
        res.status(200).json(result.map((it) => ({ id: it.id, name: it.name })));
      }
    })
    .catch((error) => {
      if (error instanceof EmptyResultError) {
        res.status(200).json([]);
      } else {
        baseErrorHandler(res, next);
      }
    });
});

// Create class
classes.post(
  '/',
  [
    check('name')
      .exists()
      .isLength({ min: 5 })
      .withMessage('Minimum 5 character length name.'),
    check('password').exists(),
    validateUserRole('teacher'),
  ],
  (req, res, next) => {
    if (errorAtValidation(req, res)) {
      return;
    }
    const { name, password, user_uuid } = matchedData(req);
    Class.create({ name, password, TeacherUuid: user_uuid })
      .then(() => res.status(200).json({ success: true }))
      .catch(baseErrorHandler(res, next));
  }
);

// Delete class by teacher
classes.post(
  '/:id',
  [check('id').exists(), body('password').exists(), validateUserRole('teacher')],
  (req, res, next) => {
    if (errorAtValidation(req, res)) {
      return;
    }
    const { id, password, user_uuid } = matchedData(req);
    Class.destroy({
      where: {
        id,
        password,
        TeacherUuid: user_uuid,
      },
    })
      .then(() => {
        res.status(200).json({ success: true });
      })
      .catch(baseErrorHandler(res, next));
  }
);

const getClassStudents = async ({ classId, user_uuid }) => {
  const cls = await Class.findOne({ where: { id: classId, TeacherUuid: user_uuid } });
  if (!cls) throw new DbError({ message: 'User has no access to this class!' });
  return await getStudentWithSolutions(await cls.getStudents());
};

const getStudentWithSolutions = async (students) => {
  return await Promise.all(
    students.map(async (student) => {
      const solutions = await student.getSolutions();
      const { uuid, firstName, lastName, email, role, createdAt, updatedAt } = student;
      return {
        student: { uuid, firstName, lastName, email, role, createdAt, updatedAt },
        solutions: await Promise.all(
          solutions.map(async (solution) => {
            const task = await Task.findById(solution.taskId);
            return {
              solution,
              task: { id: task.id, deadline: task.deadline, status: task.status, points: task.points },
            };
          })
        ),
      };
    })
  );
};

classes.get('/:classId/students', validateUserRole('teacher'), param('classId').exists(), (req, res, next) => {
  if (!errorAtValidation(req, res)) {
    const { classId, user_uuid } = matchedData(req);
    getClassStudents({ classId, user_uuid })
      .then((students) => res.status(200).json(students))
      .catch(baseErrorHandler(res, next));
  }
});

const getClassTasks = async ({ classId, user_uuid }) => {
  const cls = await Class.findOne({ where: { id: classId } });
  const students = await cls.getStudents();
  const creator = await cls.getTeacher();
  const student = students.find((it) => {
    return it.uuid === user_uuid;
  });
  if (student || creator.uuid === user_uuid) {
    return await cls.getTasks();
  } else {
    throw new DbError({ message: 'User has no access to this class.' });
  }
};

classes.get('/:classId/tasks', validateUserExists(), param('classId').exists(), (req, res, next) => {
  if (!errorAtValidation(req, res)) {
    const { classId, user_uuid } = matchedData(req);
    getClassTasks({ classId, user_uuid })
      .then((tasks) => {
        res.status(200).json(
          tasks.map((it) => {
            const { id, name, description, status, deadline, points, createdAt, updatedAt, parentId: ParentId } = it;
            return { id, name, description, status, deadline, points, createdAt, updatedAt, parentId: ParentId };
          })
        );
      })
      .catch(baseErrorHandler(res, next));
  }
});

const removeStudentFromClass = async ({ classId, studentId }) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new DbError({ message: 'Class with the given id not found' });
  const student = await User.findById(studentId);
  if (!student) throw new DbError({ message: 'User with the given id not found' });
  return await student.removeClass(cls);
};

classes.delete(
  '/:classId',
  [validateUserRole('teacher'), param('classId').exists(), query('studentId').exists()],
  (req, res, next) => {
    if (errorAtValidation(req, res)) {
      return;
    }
    const { classId, user_uuid, studentId } = matchedData(req);
    return removeStudentFromClass({ classId, studentId })
      .then((result) => {
        return res.status(200).json({ success: true });
      })
      .catch(baseErrorHandler(res, next));
  }
);

export default classes;
