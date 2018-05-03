import React from 'react';
import { camelCase, startCase } from 'lodash';

import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';
import { FormControlLabel } from 'material-ui/es/Form';
import Switch from 'material-ui/es/Switch/Switch';
import TextField from 'material-ui/TextField/TextField';
import FormGroup from 'material-ui/es/Form/FormGroup';
import Collapse from 'material-ui/es/transitions/Collapse';
import Done from 'material-ui-icons/es/Done';

import {
  checkIfCodeIsValid,
  checkIfEmailUsed,
  convertObjectToErrorText,
  errorsModel,
  submitSignup,
  userModel,
  validateUserInfo,
} from '@/utils';

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
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
  },
  input: {
    marginTop: theme.spacing.unit * 3,
  },
});

@withStyles(styles)
export default class SignUp extends React.Component {
  state = {
    activeStep: 0,
    userModel: userModel,
    errors: errorsModel,
    touched: { ...Object.keys(userModel).reduce((a, k) => ({ ...a, [k]: false }), {}), role: true },
    usedEmail: false,
    validCode: false,
    checked: {
      value: false,
      label: 'Student',
    },
  };

  handleBlur = (event) => {
    this.handleInput(event);
    this.setState({
      ...this.state,
      touched: { ...this.state.touched, [event.target.name]: true },
    });
  };

  handleInput = (event) => {
    let inputName = event.target.name;
    this.setState(
      {
        ...this.state,
        userModel: { ...this.state.userModel, [inputName]: event.target.value },
      },
      () => {
        const { errors } = this.state;
        this.setState({
          ...this.state,
          errors: {
            ...validateUserInfo(this.state.userModel, errors, inputName),
          },
        });
      }
    );
  };

  validateCode = (event) => {
    const { userModel: { code }, errors:errors2 } = this.state;
    this.handleBlur(event);
    if (code === '') {
      this.setState({ validCode: false });
      return;
    }
    checkIfCodeIsValid(code)
      .then((data) => {
        const { errors } = data;
        if (errors) {
          this.setState({
            ...this.state,
            errors: { ...errors2, code: [...errors2.code, errors.join('\n')] },
            validCode:false,
          });
        }else{
          this.setState({validCode:true})
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  validateEmail = (event) => {
    const { userModel: { email }, errors:errors2 } = this.state;
    this.handleBlur(event);
    if (email === '') {
      this.setState({ usedEmail: false });
      return;
    }
    checkIfEmailUsed(email)
      .then((data) => {
        const { errors } = data;
        if (errors) {
          this.setState({
            ...this.state,
            errors: { ...errors2, email: [...errors2.email, errors.join('\n')] },
            usedEmail:true,
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  handleChecked = (e) => {
    this.setState({
      ...this.state,
      touched: { ...this.state.touched },
      checked: { ...this.state.checked, value: e.target.checked },
      userModel: { ...this.state.userModel, role: e.target.checked ? 'teacher' : 'student' },
    });
  };

  dataIsValid() {
    let { touched, errors } = this.state;
    if (this.state.userModel.role !== 'teacher') {
      let { code: _1, ...touched2 } = touched;
      let { code: _2, ...errors2 } = errors;
      touched = touched2;
      errors = errors2;
    }
    const allTouched = Object.values(touched).reduce((a, e) => a && e, true);
    const noErrors = Object.values(errors).reduce((a, e) => a && e.length === 0, true);
    const result = allTouched && noErrors && !this.state.usedEmail;
    return this.state.userModel.role === 'teacher' ? result && this.state.validCode : result;
  }

  submitUserData = (event) => {
    event.preventDefault();
    if (this.dataIsValid()) {
      submitSignup(this.state.userModel)
        .then(({ result, data }) => {
          if (result) {
            this.props.authFunction(data);
          } else {
            this.setState({ error: data });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  renderTextField = ({
    label,
    type = 'text',
    required = true,
    autoFocus = false,
    onChange = this.handleInput,
    onBlur = this.handleBlur,
    ...props
  }) => {
    const name = camelCase(label);

    const { errors, userModel, touched } = this.state;
    return (
      <div>
        <TextField
          required={required}
          label={label}
          name={name}
          type={type}
          value={userModel[name]}
          onChange={onChange}
          helperText={convertObjectToErrorText(name, errors)}
          {...{ error: errors[name].length > 0 }}
          onBlur={onBlur}
          margin="normal"
          {...(autoFocus ? { autoFocus: true } : { autoFocus: false })}
          {...props}
        />
        {userModel[name] !== '' && errors[name].length === 0 && touched[name] && <Done />}
      </div>
    );
  };

  render() {
    const { userModel, checked, code, errors } = this.state;
    const { classes } = this.props;
    return (
      <Paper className={classes.root}>
        <Typography variant="headline" component="h3">
          Sign up
        </Typography>
        <div className={classes.container}>
          <form className={classes.form} method="POST" onSubmit={this.submitUserData}>
            {this.renderTextField({ label: 'First Name', autoFocus: true })}
            {this.renderTextField({ label: 'Last Name' })}
            {this.renderTextField({
              label: 'Email',
              type: 'email',
              onBlur: this.validateEmail,
            })}
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={checked.value} onChange={this.handleChecked} value="checkedA" />}
                label={startCase(userModel.role)}
              />
            </FormGroup>
            <Collapse in={checked.value}>
              {this.renderTextField({
                label: 'Code',
                required: checked.value,
                onBlur: this.validateCode,
              })}
            </Collapse>
            {this.renderTextField({
              label: 'Password',
              type: 'password',
            })}
            {this.renderTextField({
              label: 'Password again',
              type: 'password',
            })}
            <Button variant="raised" className={classes.input} type="submit">
              Submit
            </Button>
          </form>
        </div>
      </Paper>
    );
  }
}
