import React from 'react';
import PropTypes from 'prop-types';

import withStyles from 'material-ui/styles/withStyles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Menu from 'material-ui-icons/Menu';
import Avatar from 'material-ui/Avatar';
import startCase from 'lodash/startCase';

const styles = (theme) => ({
  appBar: {},
  flex: {
    flex: 1,
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
});

@withStyles(styles)
export class MemberNav extends React.Component {
  static propTypes = {
    classes: PropTypes.object,
    handleLogout: PropTypes.func.isRequired,
    handleDrawerToggle: PropTypes.func.isRequired,
  };

  render() {
    const { classes, handleLogout, currentUser, handleDrawerToggle } = this.props;


    const userName = [currentUser.firstName, currentUser.lastName].map((it) => startCase(it));
    const userInitials = userName.reduce((a, i) => a + i[0], '');
    return (
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton color="inherit" onClick={handleDrawerToggle} className={classes.navIconHide}>
            <Menu/>
          </IconButton>
          <Typography variant="title" color="inherit" className={classes.flex}>
            PyToJs web compiler
          </Typography>
          <Typography color="inherit" style={{ marginRight: '10px' }}>
            {userName.join(' ')}
          </Typography>
          <Avatar className={classes.avatar}>{userInitials}</Avatar>
          <Button onClick={handleLogout} color="inherit">
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    );
  }
}
