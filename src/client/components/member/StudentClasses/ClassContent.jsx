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
  buttonShow: {
    gridColumn: '4',
  },
});

@withStyles(styles)
export default class ClassContent extends React.Component {
  state = {
  };

  render() {
    const { classes, classId } = this.props;
    return (
      <div className={classes.root}>
        <Typography>Open tasks:</Typography>
        <Typography>Finished tasks:</Typography>

        <Button
          variant="raised"
          className={classes.buttonShow}
          component={Link}
          to={`/class/${classId}`}
        >
          Show Class
        </Button>
      </div>
    );
  }
}
