import React from 'react';
import { EnhancedTable } from '@/components/member/Class/EnhancedTable';
import withStyles from 'material-ui/styles/withStyles';
import {
  capitalizeName,
  deleteTask,
  deleteUserFromClass,
  getCurrentUser,
  getStudentsForClass,
  getTasksForClass,
  parseDate,
} from '@/utils';
import format from 'date-fns/format';
import Dialog from 'material-ui/es/Dialog/Dialog';
import DialogContent from 'material-ui/es/Dialog/DialogContent';
import DialogTitle from 'material-ui/es/Dialog/DialogTitle';
import DialogActions from 'material-ui/es/Dialog/DialogActions';
import Button from 'material-ui/es/Button/Button';
import Typography from 'material-ui/es/Typography/Typography';
import Snackbar from 'material-ui/es/Snackbar/Snackbar';
import Add from 'material-ui-icons/es/Add';
import TextField from 'material-ui/TextField/TextField';
import FormControl from 'material-ui/es/Form/FormControl';
import InputLabel from 'material-ui/es/Input/InputLabel';
import Select from 'material-ui/es/Select/Select';
import MenuItem from 'material-ui/es/Menu/MenuItem';

const styles = (theme) => ({
  rootTeacher: {
    height: '100%',
    display: 'grid',
    [theme.breakpoints.up('lg')]: {
      gridAutoFlow: 'column',
      gridAutoColumns: 'auto',
    },
    [theme.breakpoints.down('md')]: {
      gridAutoFlow: 'row',
      gridAutoRows: 'auto',
    },
  },
  rootTeacherStudent: theme.mixins.gutters({
    width: '100%',
    maxWidth: '960px',
    marginLeft: 'auto',
    marginRight: 'auto',
  }),
  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
  },
});

const columnDataStudents = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Student' },
  { id: 'points', numeric: true, disablePadding: false, label: 'Points' },
  { id: 'maxPoints', numeric: true, disablePadding: false, label: 'Max Points' },
  { id: 'lastUpload', numeric: false, disablePadding: false, label: 'Last Upload' },
];

const columnDataTasks = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Task' },
  { id: 'points', numeric: true, disablePadding: false, label: 'Max Points' },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'deadline', numeric: false, disablePadding: false, label: 'Deadline' },
  { id: 'updatedAt', numeric: false, disablePadding: false, label: 'Last Updated' },
];

@withStyles(styles)
export class Class extends React.Component {
  state = {
    snackBarOpen: false,
    snackBarMessage: '',
    currentUser: {},
    studentsDataRaw: [],
    studentsData: [],
    tasksData: [],
    loadStudentInterval: false,
    dialogs: {
      user: {
        open: false,
      },
      task: {
        open: false,
      },
      userInfo: {
        open: false,
      },
      taskInfo: {
        open: false,
      },
      taskCreate: {
        open: false,
      },
    },
    dataTaskCreate:{
      name:'',
      points: '',
      description:'',
      deadline: null,
      rule: 0,
      rule_values:'',
    }
  };

  handleSnackBarClose = (event) => {
    this.setState({ snackBarOpen: false, snackBarMessage: '' });
  };

  handleDialogOpen = (name) => () => {
    this.setState({ dialogs: { ...this.state.dialogs, [name]: { ...this.state.dialogs[name], open: true } } });
  };

  handleDialogClose = (name) => () => {
    this.setState({ dialogs: { ...this.state.dialogs, [name]: { ...this.state.dialogs[name], open: false } } });
  };

  handleTaskCreateChange = (name) => () => {

  }

  handleUserDeleteFromClass = (name) => () => {
    const classId = this.props.match.params.classId;
    const data = this.state.dialogs[name].data;
    if (getCurrentUser().role === 'teacher') {
      data.forEach((studentId) => {
        deleteUserFromClass({ classId, studentId })
          .then((result) => {
            if (result.errors) {
              this.setState({ snackBarOpen: true, snackBarMessage: result.errors.join('\n') });
            } else if (result.status || result.message) {
              this.setState({
                snackBarOpen: true,
                snackBarMessage: !!result.status ? `${result.status}: ${result.message}` : result.message,
              });
            } else {
              this.setState({ snackBarOpen: true, snackBarMessage: 'Student removed from class.' });
              this.handleDialogClose(name);
              this.loadStudents(classId);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      });
    }
  };

  handleTaskDeleteFromClass = (name) => () => {
    const classId = this.props.match.params.classId;
    const data = this.state.dialogs[name].data;
    if (getCurrentUser().role === 'teacher') {
      data.forEach((taskId) => {
        deleteTask({ taskId })
          .then((result) => {
            if (result.errors) {
              this.setState({ snackBarOpen: true, snackBarMessage: result.errors.join('\n') });
            } else if (result.status || result.message) {
              this.setState({
                snackBarOpen: true,
                snackBarMessage: !!result.status ? `${result.status}: ${result.message}` : result.message,
              });
            } else {
              this.setState({ snackBarOpen: true, snackBarMessage: 'Task deleted.' });
              this.handleDialogClose(name);
              this.loadTasks(classId);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      });
    }
  };

  handleSelected = (name) => (data) => {
    this.setState({ dialogs: { ...this.state.dialogs, [name]: { ...this.state.dialogs[name], data } } });
  };

  calculatePoints = (solutions) => {
    return solutions.reduce(
      (a, e) => ({
        ...a,
        points: a.points + (e.solution.status > 0 && !!e.task.points ? e.task.points : 0),
        maxPoints: a.maxPoints + (!!e.task.points ? e.task.points : 0),
      }),
      { points: 0, maxPoints: 0 },
    );
  };

  findLastUpdate(solutions, falseText = 'Never') {
    let unixTime = solutions.reduce((a, e) => {
      const number = Date.parse(e.solution.updatedAt);
      return number > a ? number : a;
    }, 0);
    return unixTime === 0 ? falseText : format(new Date(unixTime), 'D/M/YYYY H:m:s');
  }

  formatTasksData(data) {
    return data.map((elem) => ({
      ...elem,
      description: elem.description || '',
      points: elem.points || 0,
      status: elem.status || 'Not set',
      deadline: parseDate(elem.deadline, 'Not set') || 0,
      updatedAt: parseDate(elem.updatedAt) || 0,
    }));
  }

  formatStudentsData(data) {
    return data.map((elem) => ({
      ...elem,
      name: capitalizeName(elem.student),
      points: 0,
      maxPoints: 0,
      ...this.calculatePoints(elem.solutions),
      lastUpload: this.findLastUpdate(elem.solutions) || 0,
    }));
  }

  setStateAsync(state) {
    return new Promise((resolve) => this.setState(state, resolve));
  }

  loadStudents = (classId) => async () => {
    const students = await getStudentsForClass({ classId });
    this.setStateAsync({ studentsData: this.formatStudentsData(students) });
  };

  loadTasks = (classId) => async () => {
    const tasks = await getTasksForClass({ classId });
    const tasksData = this.formatTasksData(tasks);
    this.setStateAsync({ tasksData });
  };

  async componentDidMount() {
    this.setStateAsync({ currentUser: getCurrentUser() });
    if (getCurrentUser().role === 'teacher') {
      await this.loadStudents(this.props.match.params.classId)();
    }
    await this.loadTasks(this.props.match.params.classId)();
  }

  componentWillUnmount() {
    this.loadStudentInterval && clearInterval(this.loadStudentInterval);
    this.loadStudentInterval = false;
  }

  render() {
    const { classes } = this.props;
    const { currentUser, studentsData, tasksData } = this.state;

    return (
      <div className={currentUser.role === 'teacher' ? classes.rootTeacher : classes.rootTeacherStudent}>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={this.state.snackBarOpen}
          onClose={this.handleSnackBarClose}
          message={<span id="message-id">{this.state.snackBarMessage}</span>}
        />
        {currentUser.role === 'teacher' && (
          <EnhancedTable
            tableData={studentsData}
            columnData={columnDataStudents}
            className={classes.students}
            getIdFunction={(row) => row.student.uuid}
            onSelected={this.handleSelected('user')}
            onRowButtonClick={(data) => (e) =>
              this.props.history.push({
                pathname: `/solution/${data.student.uuid}`,
                state: { student: data.student },
              })}
            defaults={{ order: 'asc', orderBy: 'name', rowsPerPage: 10 }}
            toolbarProps={{
              title: 'Students',
              onDeleteClick: this.handleDialogOpen('user'),
              onRefreshClick: this.loadStudents(this.props.match.params.classId),
            }}
          />
        )}
        <EnhancedTable
          tableData={tasksData}
          columnData={columnDataTasks}
          className={classes.tasks}
          onSelected={this.handleSelected('task')}
          onRowButtonClick={
            currentUser.role === 'teacher'
              ? (data) => this.handleDialogOpen('taskInfo', data)
              : (data) => (e) =>
                this.props.history.push({
                  pathname: `/editor`,
                  state: { task: data },
                })
          }
          defaults={{ order: 'asc', orderBy: 'name', rowsPerPage: 10 }}
          toolbarProps={{
            title: 'Tasks',
            onDeleteClick: this.handleDialogOpen('task'),
            onRefreshClick: this.loadTasks(this.props.match.params.classId),
          }}
          hasCheckButton={currentUser.role === 'teacher'}
        />
        {currentUser.role === 'teacher' &&
        <Button
          variant="fab"
          color="primary"
          aria-label="add"
          onClick={this.handleDialogOpen('taskCreate')}
          className={classes.fab}
        >
          <Add/>
        </Button>}
        <Dialog open={this.state.dialogs.user.open} onClose={this.handleDialogClose('user')}>
          <DialogTitle>{'Remove student(s) from class?'}</DialogTitle>
          <DialogContent>
            <Typography>Are you sure that you want to remove the selected users from this class?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogClose('user')} color="secondary">
              No
            </Button>
            <Button onClick={this.handleUserDeleteFromClass('user')} color="primary" type="submit">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={this.state.dialogs.task.open} onClose={this.handleDialogClose('task')}>
          <DialogTitle>{'Delete tasks(s)?'}</DialogTitle>
          <DialogContent>
            <Typography>Are you sure that you want to delete the selected tasks?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogClose('task')} color="secondary">
              No
            </Button>
            <Button onClick={this.handleTaskDeleteFromClass('task')} color="primary" type="submit">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog fullWidth open={this.state.dialogs.taskInfo.open} onClose={this.handleDialogClose('taskInfo')}>
          <DialogTitle>{'Edit Task'}</DialogTitle>
          <DialogContent/>
          <DialogActions>
            <Button onClick={this.handleDialogClose('taskInfo')} color="secondary">
              No
            </Button>
            <Button onClick={this.handleEditTask} color="primary" type="submit">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={this.state.dialogs.taskCreate.open} onClose={this.handleDialogClose('taskCreate')}>
          <DialogTitle>{'Create Task'}</DialogTitle>
          <DialogContent>
            <form>
              <TextField
                id="name"
                label="Name"
                className={classes.textField}
                value={this.state.dataTaskCreate.name}
                onChange={this.handleTaskCreateChange('name')}
                margin="normal"
              />
              <TextField
                fullWidth
                id="description"
                label="Description"
                className={classes.textField}
                value={this.state.dataTaskCreate.description}
                onChange={this.handleTaskCreateChange('description')}
                margin="normal"
                multiline
              />
              <TextField
                fullWidth
                id="deadline"
                label="Deadline"
                type="datetime-local"
                value={this.state.dataTaskCreate.deadline}
                onChange={this.handleTaskCreateChange('date')}
                defaultValue="07:30"
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
              <TextField
                fullWidth
                id="points"
                label="Points"
                value={this.state.dataTaskCreate.points}
                onChange={this.handleTaskCreateChange('point')}
                type="number"
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: 0,
                }}
                margin="normal"
              />
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="rule-simple">Rule</InputLabel>
                <Select
                  value={this.state.dataTaskCreate.rule}
                  onChange={this.handleTaskCreateChange('rule')}
                  inputProps={{
                    name: 'rule',
                    id: 'rule-simple',
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={1}>Disable function definition</MenuItem>
                  <MenuItem value={2}>Disable while loop</MenuItem>
                  <MenuItem value={3}>Blacklist variable name</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                id="rule_values"
                label="Rule values"
                value={this.state.dataTaskCreate.rule_values}
                onChange={this.handleTaskCreateChange('rule_values')}
                type="text"
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                margin="normal"
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogClose('taskCreate')} color="secondary">
              No
            </Button>
            <Button onClick={this.handleCreateTask} color="primary" type="submit">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
