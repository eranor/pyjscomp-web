import express from 'express';
import auth from './auth';
import classes from './class';
import task from './task';
import rule from './rule';
import user from './user';
import solution from './solution';

const router = express.Router();

router.get('/', function(req, res, next) {
  res.json({ message: 'Welcome to our api!' });
});

router.use('/auth', auth);
router.use('/user', user);
router.use('/rule', rule);
router.use('/task', task);
router.use('/class', classes);
router.use('/solution', solution);

export default router;
