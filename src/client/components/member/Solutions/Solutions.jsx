import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from 'material-ui/styles/withStyles';
import { EnhancedTable } from '@/components/member/Class/EnhancedTable';
import Dialog from 'material-ui/es/Dialog/Dialog';
import DialogTitle from 'material-ui/es/Dialog/DialogTitle';
import DialogContent from 'material-ui/es/Dialog/DialogContent';
import Typography from 'material-ui/es/Typography/Typography';
import DialogActions from 'material-ui/es/Dialog/DialogActions';
import Button from 'material-ui/es/Button/Button';
import { capitalizeName, getCurrentUser, getSolutionsForStudent, getTasksForClass } from '@/utils';

const styles = (theme) => ({
  root: theme.mixins.gutters({
    width: '100%',
    maxWidth: '960px',
    marginLeft: 'auto',
    marginRight: 'auto',
  }),
});

const columnDataTasks = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Task' },
  { id: 'value', numeric: true, disablePadding: false, label: 'Value' },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'updatedAt', numeric: false, disablePadding: false, label: 'Last Updated' },
];

@withStyles(styles)
export class Solutions extends Component {
  static propTypes = {};
  static defaultProps = {};

  state = {
    student: {},
    solutionsData:[],
    dialogs: {
      solution: {
        open: false,
      },
    },
  };

  formatSolutionsData = (data) => {
    return data.map((raw)=>{
      const {id, value, status,createdAt, task:{name}} = raw;
      return {id, name, value, status, updatedAt:createdAt, raw}
    })
  }

  loadSolutions = (studentUuid) => async () => {
    const solutions = await getSolutionsForStudent({ uuid: studentUuid });
    const solutionsData = this.formatSolutionsData(solutions);
    this.setStateAsync({  solutionsData });
  };

  setStateAsync(state) {
    return new Promise((resolve) => this.setState(state, resolve));
  }

  async componentDidMount() {
    this.setStateAsync({ ...this.state, ...this.props.location.state });
    await this.loadSolutions(this.props.match.params.userId)();
  }

  openDialog = (name, data) => () => {
    this.setState({ dialogs: { ...this.state.dialogs, [name]: { ...this.state.dialogs[name], open: true , data} } });
  };

  closeDialog = (name) => () => {
    this.setState({ dialogs: { ...this.state.dialogs, [name]: { ...this.state.dialogs[name], open: false } } });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <EnhancedTable
          tableData={this.state.solutionsData}
          columnData={columnDataTasks}
          className={classes.tasks}
          onRowButtonClick={(data) => this.openDialog('solution', data)}
          defaults={{ order: 'asc', orderBy: 'name', rowsPerPage: 10 }}
          toolbarProps={{
            title: `${capitalizeName(this.props.location.state.student)}'s solutions`,
          }}
        />
        <Dialog fullWidth open={this.state.dialogs.solution.open} onClose={ this.closeDialog('solution')}>
          <DialogTitle>{'Accept solution?'}</DialogTitle>
          <DialogContent>
            <code>{this.state.dialogs.solution.data ? this.state.dialogs.solution.data.value:''}</code>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeDialog('solution')}>
              Close
            </Button>
          </DialogActions>
          <DialogActions>
            <Button variant='raised' onClick={this.closeDialog('solution')} color="primary">
              Accept
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
