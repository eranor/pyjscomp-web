import React from 'react';
import { startCase } from 'lodash';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import withStyles from 'material-ui/styles/withStyles';
import Typography from 'material-ui/Typography';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import Checkbox from 'material-ui/Checkbox';
import Snackbar from 'material-ui/Snackbar';

import { AccountSettingPanel } from '@/components/member/Account/AccountSettingPanel';

import { deleteCurrentUser, deleteUserAccount, updateUserData, updateUserPassword } from '@/utils';

const styles = (theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    display: 'grid',
    [theme.breakpoints.up('md')]: {
      gridAutoFlow: 'row',
      gridAutoRows: 'min-content',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridGap: `${theme.spacing.unit * 2}px`,
    },
    [theme.breakpoints.down('sm')]: {
      gridAutoFlow: 'row',
      gridAutoRows: 'min-content',
      gridGap: `${theme.spacing.unit * 1}px`,
    },
  },
  content: theme.mixins.gutters({
    height: '100%',
    overflowY: 'auto',
  }),
});

@withStyles(styles)
export class Account extends React.Component {
  state = {
    expanded: 'name_panel',
    snackBarOpen: false,
    snackBarMessage: '',
    fields: {
      name: {
        firstName: '',
        lastName: '',
      },
      email: {
        email: '',
        emailConfirmation: '',
      },
      password: {
        oldPassword: '',
        newPassword: '',
        newPasswordAgain: '',
      },
      deletion: {
        password: '',
        confirmed: false,
      },
    },
    warnings: { name: [], email: [], password: [], deletion: [] },
  };

  handleFieldChange = (event) => {
    const [field, param] = event.target.name.split('_');
    if (param === 'confirmed') {
      this.setState(
        {
          fields: { ...this.state.fields, [field]: { ...this.state.fields[field], [param]: event.target.checked } },
        },
        () => this.validate(field)
      );
    } else {
      this.setState(
        {
          fields: { ...this.state.fields, [field]: { ...this.state.fields[field], [param]: event.target.value } },
        },
        () => this.validate(field)
      );
    }
  };

  handlePanelChange = (panel) => {
    return {
      expanded: this.state.expanded,
      handleChange: (event, expanded) => {
        this.setState({
          expanded: expanded ? panel : false,
        });
      },
    };
  };

  handleSnackBarClose = (event) => {
    this.setState({ snackBarOpen: false, snackBarMessage: '' });
  };

  handleSubmit = (field) => (event) => {
    updateUserData(this.state.fields[field])
      .then(({ errors }) => {
        if (errors) {
          this.setState({ snackBarOpen: true, snackBarMessage: errors.join('\n') });
        } else {
          this.setState({ snackBarOpen: true, snackBarMessage: `${startCase(field)} updated!` });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  validateEmail = () => {
    const { email, emailConfirmation } = this.state.fields.email;
    if (email !== emailConfirmation) {
      this.setState({
        warnings: { ...this.state.warnings, email: ["Emails don't match!"] },
      });
    } else {
      this.setState({ warnings: { ...this.state.warnings, email: [] } });
    }
  };

  validatePassword = () => {
    const { newPassword, newPasswordAgain, oldPassword } = this.state.fields.password;
    if (newPassword !== newPasswordAgain) {
      this.setState({ warnings: { ...this.state.warnings, password: ["New passwords don't match"] } });
    }
    if (oldPassword === newPasswordAgain || oldPassword === newPassword) {
      this.setState({ snackBarOpen: true, snackBarMessage: 'New password cannot be the same as the old!' });
    }
  };

  handlePasswordSubmit = (event) => {
    //console.log(event);
    updateUserPassword(this.state.fields.password)
      .then(({ errors }) => {
        if (errors) {
          this.setState({ snackBarOpen: true, snackBarMessage: errors.join('\n') });
        } else {
          this.setState({ snackBarOpen: true, snackBarMessage: `Password updated!` });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  handleDeletionSubmit = (event) => {
    if (this.state.fields.deletion.confirmed) {
      deleteUserAccount({ password: this.state.fields.deletion.password })
        .then(({ errors }) => {
          if (errors) {
            this.setState({ snackBarOpen: true, snackBarMessage: errors.join('\n') });
          } else {
            deleteCurrentUser();
            this.props.history.push('/');
            window.location.reload();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  validate = (field) => {
    if (field === 'email') {
      this.validateEmail();
    } else if (field === 'password') {
      this.validatePassword();
    }
  };

  ifAllFieldNotFilled = (field) => {
    const f = Object.values(this.state.fields[field]).reduce((a, e) => [...a, e.length > 0], []);
    return f.reduce((a, e) => a && !e, true);
  };

  ifFieldsNotFilled = (field) => {
    return Object.values(this.state.fields[field]).reduce((a, e) => a || e.length === 0, false);
  };

  render() {
    const { classes } = this.props;
    const { fields: { name, email, password, deletion } } = this.state;

    return (
      <div className={classes.root}>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={this.state.snackBarOpen}
          onClose={this.handleSnackBarClose}
          message={<span id="message-id">{this.state.snackBarMessage}</span>}
        />
        <AccountSettingPanel
          name="name"
          onChange={this.handlePanelChange}
          heading="Change user information"
          detailsClass={classes.details}
          buttonProps={{ disabled: this.ifAllFieldNotFilled('name'), onClick: this.handleSubmit('name') }}
        >
          <Grid container spacing={16} direction="row" justify="flex-start">
            {Object.keys(name).map((it, i) => (
              <Grid key={i} item>
                <TextField
                  name={`name_${it}`}
                  onChange={this.handleFieldChange}
                  value={name[it]}
                  label={startCase(it)}
                  error={this.state.warnings.name.length > 0}
                  helperText={this.state.warnings.name.join('\n')}
                />
              </Grid>
            ))}
          </Grid>
        </AccountSettingPanel>
        <AccountSettingPanel
          name="email"
          onChange={this.handlePanelChange}
          heading="Change e-mail address"
          detailsClass={classes.details}
          buttonProps={{
            disabled: this.ifFieldsNotFilled('email'),
            onClick: this.handleSubmit('email'),
          }}
        >
          <Grid container spacing={16} direction="row" justify="flex-start">
            {Object.keys(email).map((it, i) => (
              <Grid key={i} item>
                <TextField
                  name={`email_${it}`}
                  onChange={(e) => {
                    this.handleFieldChange(e);
                  }}
                  type="email"
                  value={email[it]}
                  label={startCase(it)}
                  error={this.state.warnings.email.length > 0}
                  helperText={this.state.warnings.email.join('\n')}
                />
              </Grid>
            ))}
          </Grid>
        </AccountSettingPanel>
        <AccountSettingPanel
          name="password"
          onChange={this.handlePanelChange}
          heading="Password change"
          detailsClass={classes.details}
          buttonProps={{ disabled: this.ifFieldsNotFilled('password'), onClick: this.handlePasswordSubmit }}
        >
          <Grid container spacing={16} direction="row" justify="flex-start">
            {Object.keys(password).map((it, i) => (
              <Grid key={i} item>
                <TextField
                  name={`password_${it}`}
                  onChange={this.handleFieldChange}
                  type="password"
                  value={password[it]}
                  label={startCase(it)}
                  error={this.state.warnings.password.length > 0}
                  helperText={this.state.warnings.password.join('\n')}
                />
              </Grid>
            ))}
          </Grid>
        </AccountSettingPanel>
        <AccountSettingPanel
          name="deletion"
          onChange={this.handlePanelChange}
          heading="Account Deletion"
          detailsClass={classes.details}
          buttonText="Confirm"
          buttonProps={{
            color: 'secondary',
            disabled: deletion.password.length === 0 || !deletion.confirmed,
            onClick: this.handleDeletionSubmit,
          }}
        >
          <Grid container spacing={16} direction="row" justify="flex-start">
            <Grid item>
              <TextField
                name="deletion_password"
                onChange={this.handleFieldChange}
                type="password"
                label={'Password'}
                value={deletion.password}
              />
            </Grid>
            {deletion.password.length > 0 && (
              <Grid item>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="deletion_confirmed"
                        onChange={this.handleFieldChange}
                        value="confirmed"
                        checked={deletion.confirmed}
                      />
                    }
                    label="Check for agreeing to deletion"
                  />
                </FormGroup>
              </Grid>
            )}
            <Grid item style={{ width: '100%' }}>
              <Typography>This action will permanently delete your account! Be sure before you do this.</Typography>
            </Grid>
          </Grid>
        </AccountSettingPanel>
      </div>
    );
  }
}
