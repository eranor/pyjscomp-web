import React from 'react';
import PropTypes from 'prop-types';

import withStyles from 'material-ui/styles/withStyles';
import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import Fade from 'material-ui/transitions/Fade';

import { submitLogin } from 'utils';
import Snackbar from 'material-ui/Snackbar';
import { TextField } from 'material-ui';

//TODO Delete this
const testTeacherLoginData = {
  email: 'michaela.zimmer@example.com',
  password: 'EgaRogRNhOWBYifMedysus',
};
const testStudentLoginData = {
  email: 'julio.sutton@example.com',
  password: 'yZpnBvwFctSLhTylSYxjVZSWYciGN',
};

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const styles = (theme) => ({
  root: theme.mixins.gutters({
    ...getModalStyle(),
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  }),
  form: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
  },
  input: {
    marginTop: theme.spacing.unit * 3,
  },
});

@withStyles(styles)
export class Login extends React.Component {
  static propTypes = {
    classes: PropTypes.object,
    authFunction: PropTypes.func.isRequired,
  };

  state = {
    userModel: { email: '', password: '' },
    error: { status: null, message: '' },
  };

  handleUserModelChange = (e) => {
    let inputName = e.target.name;
    let userModel = { ...this.state.userModel };
    userModel[inputName] = e.target.value;
    this.setState({ userModel });
  };

  handleSubmitLogin = (e) => {
    e.preventDefault();
    submitLogin(this.state.userModel)
      .then(({ errors, data }) => {
        if (errors) {
          this.setState({ error: { message: errors.join('\n') } });
        } else {
          this.props.authFunction(data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  handleClose = () => {
    this.setState({ error: { status: null, message: '' } });
  };

  render() {
    const { error: { status, message } } = this.state;
    const { classes } = this.props;
    return (
      <Paper className={classes.root} elevation={1}>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={2000}
          open={!!status || message.length > 0}
          onClose={this.handleClose}
          SnackbarContentProps={{ 'aria-describedby': 'message-id' }}
          message={<span id="message-id">{!!status ? `${status}: ${message}` : message}</span>}
        />
        <div className={classes.container}>
          <div style={{ gridArea: 'header' }}>
            <Typography variant="headline" component="h1">
              Login
            </Typography>
          </div>
          <Button variant="raised" onClick={() => this.setState({ userModel: testStudentLoginData })}>
            Test Student
          </Button>
          <Button variant="raised" onClick={() => this.setState({ userModel: testTeacherLoginData })}>
            Test Teacher
          </Button>
          <form onSubmit={this.handleSubmitLogin} className={classes.form}>
            <TextField
              label="Email"
              id="email"
              name="email"
              type="email"
              value={this.state.userModel.email}
              onChange={this.handleUserModelChange}
              margin="normal"
              autoFocus
            />
            <TextField
              margin="normal"
              label="Password"
              id="password"
              name="password"
              type="password"
              value={this.state.userModel.password}
              onChange={this.handleUserModelChange}
            />
            <Button variant="raised" className={classes.input} type="submit">
              Submit
            </Button>
          </form>
        </div>
      </Paper>
    );
  }
}
