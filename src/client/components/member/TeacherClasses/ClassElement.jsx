import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'material-ui/styles/withStyles';
import Typography from 'material-ui/Typography';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Loadable from 'react-loadable';
import { addDays } from 'date-fns';
import { Loading } from '@/components/Loading';
import { capitalizeName } from '@/utils';

const styles = (theme) => ({
  root: {
    width: '100%',
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
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const ClassContent = Loadable({
  loader: () => import('./ClassContent'),
  loading: Loading,
  delay: 300,
});

@withStyles(styles)
export class ClassElement extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    name: PropTypes.string.isRequired,
    className: PropTypes.string,
    expanded: PropTypes.bool,
    onChange: PropTypes.func,
  };

  state = {};

  componentDidMount() {}

  componentWillReceiveProps(component) {
    if (component.expanded === true && !this.state.studentCount && !this.state.tasks) {
      //this.loadStudentsFromServer();
      //this.loadTasksFromServer();
      //this.forceUpdate();
    }
  }

  loadTasksFromServer() {
    let tasks = [
      {
        name: 'Task 1',
        description: '',
        status: 1,
        deadline: addDays(new Date(), 7),
        points: 5,
        subtasks: [
          { name: 'Task 1.1', description: '', status: 1, points: 2 },
          { name: 'Task 1.2', description: '', status: 1, points: 3 },
        ],
      },
      {
        name: 'Task 2',
        description: '',
        status: 1,
        deadline: addDays(new Date(), 14),
        points: 5,
        subtasks: [
          { name: 'Task 2.1', description: '', status: 1, points: 2 },
          { name: 'Task 2.2', description: '', status: 1, points: 3 },
        ],
      },
    ];
    new Promise((resolve, reject) => {
      setTimeout(resolve, 3000);
    }).then(() => this.setState({ tasks }));
  }

  render() {
    const { tasks, studentCount } = this.state;
    const {
      name,
      children,
      students,
      teacher,
      password,
      classes,
      classId,
      expanded,
      onChange,
      onDelete,
    } = this.props;
    return (
      <ExpansionPanel expanded={expanded} onChange={onChange}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>{name}</Typography>
          <Typography className={classes.secondaryHeading}>{capitalizeName(teacher)}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <ClassContent
            handleDelete={onDelete}
            studentCount={students.length}
            password={password}
            classId={classId}
          />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}
