import React, { Component } from 'react';
import withStyles from 'material-ui/styles/withStyles';
import ExpansionPanel from 'material-ui/es/ExpansionPanel/ExpansionPanel';
import ExpansionPanelSummary from 'material-ui/es/ExpansionPanel/ExpansionPanelSummary';
import Typography from 'material-ui/es/Typography/Typography';
import ExpansionPanelDetails from 'material-ui/es/ExpansionPanel/ExpansionPanelDetails';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import FormControl from 'material-ui/es/Form/FormControl';
import InputLabel from 'material-ui/es/Input/InputLabel';
import Select from 'material-ui/es/Select/Select';
import MenuItem from 'material-ui/es/Menu/MenuItem';
import Paper from 'material-ui/es/Paper/Paper';
import Button from 'material-ui/es/Button/Button';

const styles = (theme) => ({
  root: {
    overflowX: 'auto',
    minWidth: 0,
    minHeight: 0,
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
});

@withStyles(styles)
export class TasksPanel extends Component {
  static propTypes = {};
  static defaultProps = {};

  state = {
    task: '',
  };

  render() {
    const { classes, onSelect, tasks, onCompile } = this.props;
    const { expanded, task } = this.state;
    const currentTask = task !== '' ? tasks[task] : undefined;
    return (
      <div className={classes.root}>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="task-simple">Task</InputLabel>
          <Select
            value={this.state.task}
            onChange={(e) => {
              this.setState({ [e.target.name]: e.target.value });
              onSelect(tasks[task]);
            }}
            inputProps={{
              name: 'task',
              id: 'task-simple',
            }}
            autoWidth
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {tasks.map((task, i) => (
              <MenuItem key={i} value={task.id}>
                {task.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {task === '' && <Typography>Please select a task</Typography>}
        {task !== '' && (
          <Paper>
            {currentTask.name}
            {currentTask.description}
            {currentTask.deadline}
            <div>
              <Typography variant="title">Rules</Typography>
              {currentTask.rules.map((it, i) => <Typography variant="body2">{it.name}</Typography>)}
            </div>
            <Button variant="raised" onClick={onCompile}>
              Compile
            </Button>
          </Paper>
        )}
      </div>
    );
  }
}
