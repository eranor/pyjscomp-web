import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import Hidden from 'material-ui/Hidden';
import Drawer from 'material-ui/Drawer';
import withStyles from 'material-ui/styles/withStyles';
import Divider from 'material-ui/Divider';
import List, { ListItem, ListItemIcon } from 'material-ui/List';
import Home from 'material-ui-icons/Home';
import Info from 'material-ui-icons/Info';

import { Routes } from '@/routes';
import { Footer } from '@/components/Footer';
import { MemberNav } from '@/components/nav/MemberNav';
import { GuestNav } from '@/components/nav/GuestNav';
import { deleteCurrentUser, setCurrentUser } from '../utils';

const drawerWidth = 240;

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflowX: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  appBar: {
    position: 'absolute',
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
    [theme.breakpoints.up('md')]: {
      position: 'relative',
    },
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    display: 'grid',
    gridTemplateRows: 'min-content auto min-content',
  },
  main: {
    height: '100%',
    overflowY: 'hidden',
    '& > *': {
      height: '100%',
      overflowY: 'auto',
    },
  },
});

@withRouter
@withStyles(styles, { withTheme: true })
export class App extends React.Component {
  static propTypes = {
    classes: PropTypes.object,
    theme: PropTypes.object,
  };

  state = {
    mobileOpen: false,
    currentUser: null,
  };

  componentDidMount() {
    const item = localStorage.getItem('loggedInUser');
    if (item) {
      this.setState({ currentUser: JSON.parse(item), isAuthenticated: true });
    }
  }

  authenticate = (data) => {
    this.setState({
      isAuthenticated: !this.state.isAuthenticated,
      currentUser: data.user,
      token: data.token,
    });
    setCurrentUser(data);
  };

  logout = () => {
    this.setState({ isAuthenticated: !this.state.isAuthenticated, currentUser: null });
    deleteCurrentUser();
    this.props.history.push('/');
    window.location.reload();
  };

  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      mobileOpen: false,
    };
  }

  handleDrawerToggle = () => this.setState({ mobileOpen: !this.state.mobileOpen });

  render() {
    const { classes, theme } = this.props;
    const { isAuthenticated, mobileOpen, currentUser } = this.state;

    const publicDrawerItems = [
      { name: 'Home', icon: <Home/>, path: '/' },
      { name: 'About', icon: <Info/>, path: '/about' },
    ];

    const privateDrawerItems = [
      { name: 'Classes', path: '/classes', roles: ['student', 'teacher'] },
      { name: 'Editor', path: '/editor', roles: ['student', 'teacher'] },
      { name: 'Account', path: '/account', roles: ['student', 'teacher'] },
    ];

    const drawer = (
      <div>
        <div className={classes.toolbar}/>
        <Divider/>
        <List>
          {publicDrawerItems.map(({ name, path, icon }) => (
            <ListItem
              key={Math.floor(Math.random() * 1000)}
              button
              onClick={this.handleDrawerToggle}
              component={Link}
              to={path}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              {name}
            </ListItem>
          ))}
        </List>
        {isAuthenticated && (
          <div>
            <Divider/>
            <List>
              {privateDrawerItems.filter(({ roles }) => roles.includes(currentUser.role)).map(({ name, path }) => (
                <ListItem
                  key={Math.floor(Math.random() * 1000)}
                  button
                  onClick={this.handleDrawerToggle}
                  component={Link}
                  to={path}
                >
                  {name}
                </ListItem>
              ))}
            </List>
          </div>
        )}
        <List/>
      </div>
    );

    return (
      <div className={classes.root}>
        {isAuthenticated ? (
          <MemberNav
            classes={{ appBar: classes.appBar }}
            handleLogout={this.logout}
            handleDrawerToggle={this.handleDrawerToggle}
            currentUser={this.state.currentUser}
          />
        ) : (
          <GuestNav
            classes={{ appBar: classes.appBar }}
            authFunction={this.authenticate}
            handleDrawerToggle={this.handleDrawerToggle}
          />
        )}
        <Hidden mdUp>
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={this.handleDrawerToggle}
            classes={{ paper: classes.drawerPaper }}
            ModalProps={{ keepMounted: true }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer variant="permanent" open classes={{ paper: classes.drawerPaper }}>
            {drawer}
          </Drawer>
        </Hidden>
        <div className={classes.content}>
          <div className={classes.toolbar}/>
          <main className={classes.main}>
            <Routes isAuthenticated={isAuthenticated}/>
          </main>
          <Footer classes={{ root: classes.footer }}/>
        </div>
      </div>
    );
  }
}
