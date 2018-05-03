import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactPaginate from 'react-paginate';
import withStyles from 'material-ui/styles/withStyles';
import ChevronLeft from 'mdi-material-ui/ChevronLeft';
import ChevronRight from 'mdi-material-ui/ChevronRight';
import Add from 'material-ui-icons/Add';
import Button from 'material-ui/Button';

import { styles } from './styles';
import { ClassElement } from './ClassElement';
import Dialog from 'material-ui/es/Dialog/Dialog';
import DialogTitle from 'material-ui/es/Dialog/DialogTitle';
import DialogContent from 'material-ui/es/Dialog/DialogContent';
import DialogActions from 'material-ui/es/Dialog/DialogActions';
import {
  getCurrentUser,
  createNewClass,
  deleteClass,
  getClassesForTeacher,
  getClassesForStudent,
} from '@/utils';
import Snackbar from 'material-ui/es/Snackbar/Snackbar';
import TextField from 'material-ui/es/TextField/TextField';
import { Loading } from '@/components/Loading';
import Typography from 'material-ui/es/Typography/Typography';
import LinearProgress from 'material-ui/es/Progress/LinearProgress';

@withStyles(styles)
export class TeacherClasses extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  state = {
    expanded: null,
    offset: 0,
    perPage: 10,
    data: [],
    dialogOpen: false,
    snackBarOpen: false,
    snackBarMessage: '',
    classModel: { name: '', password: '' },
    loading: true,
  };

  handleChange = (key) => (event, expanded) => {
    this.setState({ expanded: expanded ? key : false });
  };

  handlePageClick = (data) => {
    let selected = data.selected;
    let offset = Math.ceil(selected * this.state.perPage);
    this.setState({ offset }, () => {
      this.loadClassesFromServer();
    });
  };

  handleClose = (event) => {
    this.setState({ dialogOpen: false });
  };

  handleOpen = (event) => {
    this.setState({ dialogOpen: true });
  };

  handleSubmit = (event) => {
    const valid = Object.values(this.state.classModel).reduce(
      (a, e) => a && e.length > 1 && e.length < 30,
      true
    );
    if (valid) {
      createNewClass(this.state.classModel)
        .then(({ errors }) => {
          if (errors) {
            this.setState({ snackBarOpen: true, snackBarMessage: errors.join('\n') });
          } else {
            this.setState({ snackBarOpen: true, snackBarMessage: 'Class created!' });
            this.loadClassesFromServer();
          }
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      this.setState({ snackBarOpen: true, snackBarMessage: 'Invalid name or password!' });
    }
    this.handleClose();
  };

  handleDelete = (classId, password, handleClose) => (event) => {
    const find = this.state.data.find((it) => it.id === classId);
    if (find.password === password) {
      deleteClass({ id: classId, password })
        .then((result) => {
          if (result) {
            this.setState({ snackBarOpen: true, snackBarMessage: 'Class deleted.' });
            handleClose();
            this.loadClassesFromServer();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      this.setState({ snackBarOpen: true, snackBarMessage: 'Invalid password!' });
    }
  };

  handleSnackBarClose = (event) => {
    this.setState({ snackBarOpen: false, snackBarMessage: '' });
  };

  handleClassModelChange = (event) => {
    this.setState({
      classModel: { ...this.state.classModel, [event.target.name]: event.target.value },
    });
  };

  loadClassesFromServer() {
    getClassesForTeacher().then((data) => {
      this.setState({ students: data });
      let classes = data.slice(this.state.offset, this.state.offset + this.state.perPage);
      let meta = { total_count: data.length, limit: this.state.perPage };
      this.setState({
        data: classes,
        pageCount: Math.ceil(meta.total_count / meta.limit),
      });
    });
  }



  componentDidMount() {
    setTimeout(() => this.loadClassesFromServer(), 300);
    setTimeout(() => this.setState({ loading: false }), 3000);
  }

  render() {
    const { classes } = this.props;
    const { expanded, data, loading } = this.state;
    const fabClassName = classNames(classes.fab, open);
    return (
      <div className={classes.root}>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={this.state.snackBarOpen}
          onClose={this.handleSnackBarClose}
          message={<span id="message-id">{this.state.snackBarMessage}</span>}
        />
        <div className={classes.content}>
          <div>
            {data.map(({ id, password, name, Teacher: teacher, Students: students }, i) => (
              <ClassElement
                key={i}
                classId={id}
                name={name}
                teacher={teacher}
                students={students}
                password={password}
                expanded={expanded === i}
                onDelete={this.handleDelete}
                onChange={this.handleChange(i)}
              >
                <div>hello</div>
              </ClassElement>
            ))}
          </div>
          {data.length > 0 && (
            <div>
              <ReactPaginate
                previousLabel={
                  <Button>
                    <ChevronLeft />
                  </Button>
                }
                previousClassName={classes.previous}
                nextLabel={
                  <Button>
                    <ChevronRight />
                  </Button>
                }
                nextClassName={classes.previous}
                breakLabel={<a href="">...</a>}
                breakClassName={'break-me'}
                pageCount={this.state.pageCount}
                pageClassName={classes.page}
                pageLinkClassName={classes.pageLink}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={this.handlePageClick}
                containerClassName={classes.pagination}
                subContainerClassName={'pages pagination'}
                activeClassName={'active'}
              />
            </div>
          )}
          {data.length === 0 &&
            loading && (
              <div>
                <Typography align="center">Loading... </Typography>
                <LinearProgress variant="query" />
              </div>
            )}
          {data.length === 0 &&
            !loading && (
              <Button
                variant="raised"
                color="primary"
                aria-label="add"
                onClick={this.handleOpen}
                className={classes.newClassButton}
              >
                Create a new class
              </Button>
            )}
        </div>
        {data.length > 0 && (
          <Button
            variant="fab"
            color="primary"
            aria-label="add"
            onClick={this.handleOpen}
            className={fabClassName}
          >
            <Add />
          </Button>
        )}
        <Dialog open={this.state.dialogOpen} onClose={this.handleClose}>
          <DialogTitle>{'Create a new class'}</DialogTitle>
          <DialogContent>
            <form className={classes.newClassDialog}>
              <TextField row label="Name" name="name" onChange={this.handleClassModelChange} />
              <TextField row label="Password" name="password" onChange={this.handleClassModelChange} />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.handleSubmit} color="primary" type="submit">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
