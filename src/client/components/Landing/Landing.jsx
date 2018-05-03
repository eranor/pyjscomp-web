import React from 'react';
import PropTypes from 'prop-types';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import withStyles from 'material-ui/styles/withStyles';

const styles = (theme) => ({
  root: theme.mixins.gutters({
    paddingTop: theme.spacing.unit * 3,
    margin: '0 auto',
    width: '80%',
  }),
});

export const Landing = withStyles(styles)((props) => {
  const { classes } = props;
  return (
    <main className={classes.root}>
      <Grid container spacing={24}>
        <Grid item xs={12} component="article">
          <Typography variant={'display1'} gutterBottom>
            Welcome
          </Typography>
          <Typography variant={'body1'} paragraph>
            This application is my university masters degree project, with a goal to implement and
            evaluate the effectiveness of a configurable Python compiler, in a classroom
            environment.
          </Typography>
          <Typography variant={'body1'} paragraph>
            Here is a (not feature complete) Python(3.5+) compiler implemented in
            Typescript/Javascript, with the main feature of the capability to configure the what
            parts of the language can be used in the python_code.
          </Typography>
        </Grid>
      </Grid>
    </main>
  );
});

Landing.propTypes = {
  classes: PropTypes.object,
};
