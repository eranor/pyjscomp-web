import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from 'material-ui/styles/withStyles';

const styles = (theme) => ({
  root: theme.mixins.gutters({}),
});

@withStyles(styles)
export class NoLogin extends Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <h1>Error!</h1>
        <p>You need to login!</p>
      </div>
    );
  }
}
