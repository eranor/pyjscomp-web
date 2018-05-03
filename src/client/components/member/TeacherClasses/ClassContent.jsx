import React from 'react';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import withStyles from 'material-ui/styles/withStyles';
import { Link } from 'react-router-dom';
import DialogTitle from 'material-ui/es/Dialog/DialogTitle';
import DialogContent from 'material-ui/es/Dialog/DialogContent';
import DialogContentText from 'material-ui/es/Dialog/DialogContentText';
import DialogActions from 'material-ui/es/Dialog/DialogActions';
import TextField from 'material-ui/TextField/TextField';
import Dialog from 'material-ui/es/Dialog/Dialog';
import red from 'material-ui/colors/red';

const styles = (theme) => ({
  root: {
    width: '100%',
    display: 'grid',
    gridRowGap: `${theme.spacing.unit * 2}px`,
    gridTemplateColumns: 'repeat(4, auto)',
  },
  buttonDelete: {
    gridColumn: '2',
  },
  buttonShow: {
    gridColumn: '4',
  },
  password: {
    display: 'flex',
  },
  blurred: {
    filter: 'blur(5px)',
    '&:hover ': {
      filter: 'blur(0)',
    },
  },
  dialogText: {
    paddingBottom: theme.spacing.unit * 2,
    color: red[700],
  },
});

@withStyles(styles)
export default class ClassContent extends React.Component {
  state = {
    open: false,
    password: '',
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleChange = (e) => {
    this.setState({ password: e.target.value });
  };

  render() {
    const { classes, classId, handleDelete } = this.props;
    return (
      <div className={classes.root}>
        <Typography>Student count: {this.props.studentCount}</Typography>
        <Typography>Open tasks:</Typography>
        <Typography>Finished tasks:</Typography>
        <div className={classes.password}>
          <Typography>Password:</Typography>
          <Typography className={classes.blurred}>{this.props.password}</Typography>
        </div>
        <Button variant="raised" className={classes.buttonDelete} onClick={this.handleClickOpen}>
          Delete Class
        </Button>
        <Button variant="raised" className={classes.buttonShow} component={Link} to={`/class/${classId}`}>
          Show Class
        </Button>
        <Dialog open={this.state.open} onClose={this.handleClose}>
          <DialogTitle>{'Class deletion'}</DialogTitle>
          <DialogContent>
            <DialogContentText className={classes.dialogText}>
              Are you sure that you want to delete this class? This is an unrecoverable action, please consider this
              before advancing.
            </DialogContentText>
            <DialogContentText className={classes.dialogText}>
              If you are sure then the please enter the class password.
            </DialogContentText>
            <TextField name="password" label="Class Password" onChange={this.handleChange} />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} variant="raised" color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleDelete(classId, this.state.password, this.handleClose)}
              variant="raised"
              color="secondary"
              autoFocus
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
