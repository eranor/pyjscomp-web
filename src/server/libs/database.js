import Sequelize, { DataTypes } from 'sequelize';
import { logger } from './logging';

const DATABASE_PATH = './database.db';

const db = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: DATABASE_PATH,
  logging: (msg) => logger.info(msg),
  operatorsAliases: false,
});

export const User = db.define('user', {
  uuid: { type: DataTypes.UUIDV4, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  firstName: { type: Sequelize.STRING },
  lastName: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING, unique: true },
  password: { type: Sequelize.STRING },
  role: { type: Sequelize.ENUM('student', 'teacher'), defaultValue: 'student' },
});

User.prototype.getFullname = function() {
  return [this.firstName, this.lastName].map((it) => it.charAt(0).toUpperCase() + it.slice(1)).join(' ');
};

export const Class = db.define('class', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: Sequelize.STRING,
  password: Sequelize.STRING,
});

Class.belongsTo(User, { as: 'Teacher' });

User.belongsToMany(Class, { through: 'class_students', as: 'Classes' });
Class.belongsToMany(User, { through: 'class_students', as: 'Students' });

export const Solution = db.define('solution', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  value: {
    type: Sequelize.STRING,
  },
  status: { type: Sequelize.INTEGER, defaultValue: 0 },
});

Solution.belongsTo(User);
User.hasMany(Solution);

export const Task = db.define('task', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  status: Sequelize.INTEGER,
  deadline: Sequelize.DATE,
  points: Sequelize.INTEGER,
});

Task.belongsToMany(Class, { through: 'class_tasks' });
Class.belongsToMany(Task, { through: 'class_tasks' });

Task.belongsTo(User, { as: 'Creator' });
Task.hasOne(Task, { as: 'Parent', defaultValue: null });
Task.hasOne(Solution);

export const Rule = db.define('rule', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  value: Sequelize.STRING,
});

User.hasMany(Rule);
Rule.belongsTo(User);

Task.belongsToMany(Rule, { through: 'tasks_rules' });
Rule.belongsToMany(Task, { through: 'tasks_rules' });

export const TeacherCode = db.define('teacher_code', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  code: Sequelize.STRING,
});

// db.sync();

export default db;
