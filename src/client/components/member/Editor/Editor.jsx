import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import withStyles from 'material-ui/styles/withStyles';
import { parseDate } from '../../../utils';
import { TasksPanel } from './TasksPanel';
import Typography from 'material-ui/es/Typography/Typography';
import Paper from 'material-ui/es/Paper/Paper';
import SubdirectoryArrowRight from 'material-ui-icons/es/SubdirectoryArrowRight';
import { Compiler } from '../../../../../libs/compiler';
import { clearConsoleData, getConsoleData, getRulesForTask } from '@/utils';
import { Rule } from '../../../../../libs/compiler/rule';
import Snackbar from 'material-ui/es/Snackbar/Snackbar';
import Button from 'material-ui/es/Button/Button';

const styles = (theme) => ({
  root: {
    height: '100%',
    width: '100%',
    display: 'grid',
    gridTemplateAreas: "'editor tasks' 'editor results'",
    gridTemplateColumns: '61.8% 38.2%',
    gridTemplateRows: '1fr 1fr',
    gridGap: '5px',
  },
  editor: {
    gridArea: 'editor',
  },
  tasks: {
    padding: theme.spacing.unit * 1,
    gridArea: 'tasks',
  },
  results: {
    padding: theme.spacing.unit * 1,
    maxHeight: '345px',
    height: '100%',
    width: '100%',
    overflowX: 'auto',
  },
  resultElem: theme.mixins.gutters({
    display: 'flex',
    '& > p > pre': {
      margin: 0,
    },
  }),
  buttons: {
    paddingTop: theme.spacing.unit * 1,
    paddingBottom: theme.spacing.unit * 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
});

@withStyles(styles)
export class Editor extends React.Component {
  state = {
    task: {},
    resultCheckInterval: false,
    code: '',
    elementHeight: 0,
    rules: [],
    results: [],
    snackBarOpen: false,
    snackBarMessage: '',
  };
  editorDidMount = (editor, monaco) => {
    editor.focus();
  };
  onChange = (newValue, e) => {
    this.setState({ code: newValue });
  };

  onCompileHandler = (rule) => {
    const code = this.state.code;
    try {
      const x = this.state.compiler.compile(code).code();
      eval(x);
      this.setState({ results: getConsoleData() });
    } catch (error) {
      this.setState({ snackBarOpen: true, snackBarMessage: error.message });
    }
  };

  handleSnackBarClose = (event) => {
    this.setState({ snackBarOpen: false, snackBarMessage: '' });
  };

  componentDidMount() {
    if (this.props.location.state) {
      getRulesForTask(this.props.location.state.task.id).then((data) => {
        if (data.rules) {
          this.setState({ rules });
        } else {
          console.error(data.error);
        }
      });
    }
    this.setState({ elementHeight: this.divRef.clientHeight, compiler: new Compiler() });
    this.resultCheckInterval = setInterval(
      () => this.setState({ results: !!getConsoleData() ? getConsoleData() : [] }),
      500
    );
  }

  componentWillUnmount() {
    this.resultCheckInterval && clearInterval(this.resultCheckInterval);
    this.resultCheckInterval = false;
  }

  render() {
    const { classes } = this.props;
    const { code, elementHeight, tasks, results } = this.state;
    const options = {
      selectOnLineNumbers: true,
      automaticLayout: true,
    };
    return (
      <div ref={(element) => (this.divRef = element)} className={classes.root}>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'cener' }}
          open={this.state.snackBarOpen}
          onClose={this.handleSnackBarClose}
          message={<span id="message-id">{this.state.snackBarMessage}</span>}
        />
        <div className={classes.editor} style={{ height: `${elementHeight}px` }}>
          <MonacoEditor
            theme="vs-dark"
            language="python"
            value={code}
            options={options}
            onChange={this.onChange}
            editorDidMount={this.editorDidMount}
          />
        </div>
        <Paper elevation={2} className={classes.tasks}>
          <Typography variant="headline">Task</Typography>
          <div className={classes.buttons}>
            <Button variant="raised" onClick={this.onCompileHandler}>
              Compile
            </Button>
            <Button variant="raised" onClick={() => clearConsoleData()}>
              Clear console
            </Button>
            <Button variant="raised">Submit task</Button>
          </div>
          <div>
            {this.state.rules.length === 0 && <Typography>No rules set for this task</Typography>}
            {this.state.rules.length > 0 && (
              <ul>
                {this.state.rules.map(({ name, description, value }) => {
                  return (
                    <li style={{ display: 'flex' }}>
                      <Typography>{description}</Typography>
                      {value && <Typography>{value}</Typography>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Paper>
        <Paper elevation={2} className={classes.results}>
          <Typography variant="headline">Results</Typography>
          {results && results.map((it, i) => (
            <div className={classes.resultElem}>
              <SubdirectoryArrowRight />
              <Typography key={i} variant="body1">
                <pre>{JSON.stringify(it)}</pre>
              </Typography>
            </div>
          ))}
        </Paper>
      </div>
    );
  }
}
