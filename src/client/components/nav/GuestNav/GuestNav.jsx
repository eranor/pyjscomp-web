import React from 'react';
import PropTypes from 'prop-types';
import Loadable from 'react-loadable';

import withStyles from 'material-ui/styles/withStyles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Modal from 'material-ui/Modal';
import IconButton from 'material-ui/IconButton';
import Menu from 'material-ui-icons/Menu';

import { Loading } from '../../Loading';
import { Login } from '../Login';

const styles = (theme) => ({
  appBar: {},
  flex: {
    flex: 1,
  },
  navIconHide: {
    marginLeft: -12,
    marginRight: 20,
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
});

export const LoadableSignup = Loadable({
  loader: () => import('../SignUp/SignUp'),
  loading() {
    return <Loading />;
  },
});

@withStyles(styles)
export class GuestNav extends React.Component {
  static propTypes = {
    classes: PropTypes.object,
    authFunction: PropTypes.func.isRequired,
  };

  state = {
    showModal: false,
    signUp: true,
  };

  closeModal = () => this.setState({ signUp: false, showModal: false });

  showLogin = () => this.setState({ signUp: false, showModal: true });

  showSignUp = () => this.setState({ signUp: true, showModal: true });

  render() {
    const { classes, authFunction, handleDrawerToggle } = this.props;
    const { signUp, showModal } = this.state;

    return (
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton color="inherit" onClick={handleDrawerToggle} className={classes.navIconHide}>
            <Menu />
          </IconButton>
          <Typography variant="title" color="inherit" className={classes.flex}>
            PyToJs web compiler
          </Typography>
          <div>
            <Button onClick={this.showSignUp} color="inherit">
              Sign Up
            </Button>
            <Button onClick={this.showLogin} color="inherit">
              Login
            </Button>
            <Modal open={showModal} onClose={this.closeModal}>
              {signUp ? (
                <LoadableSignup authFunction={authFunction} />
              ) : (
                <Login authFunction={authFunction} />
              )}
            </Modal>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}
