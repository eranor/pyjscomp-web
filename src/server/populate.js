import db, { TeacherCode, User } from './libs/database';
import { uuidV4 } from './libs/utils';

TeacherCode.create({ code: 'Code2018' });

const message = fs.readFileSync('./teachers.json');
let x = JSON.parse(message);
let students = x.results.map((it) => ({
  uuid: uuidV4(),
  firstName: it.name.first,
  lastName: it.name.last,
  email: it.email,
  password: bcrypt.hashSync(it.login.password, 8),
  role: 'teacher',
}));
User.bulkCreate(students)
  .then(() => {
    // Notice: There are no arguments here, as of right now you'll have to...
    return User.findAll();
  })
  .then((users) => {
    console.log(users); // ... in order to get the array of user objects
    db.close();
  });
