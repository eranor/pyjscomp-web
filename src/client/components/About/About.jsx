import React from 'react';
import withStyles from 'material-ui/es/styles/withStyles';
import Typography from 'material-ui/es/Typography/Typography';

const styles = (theme) => ({
  root: theme.mixins.gutters({
    maxWidth: '960px',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  }),
});

export const About = withStyles(styles)((props) => {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <article className="section">
        <div className="row">
          <div className="col s12 m9 l10">
            <Typography variant='display2'>About</Typography>
            <Typography variant='headline'>Document</Typography>
            <a href="pdfs/masters_thesis.pdf">Masters Thesis in PDF format</a>
            <Typography variant='headline'>Studied literature</Typography>
            <ul className="collection">
              <li className="collection-item">
                <a href="pdfs/p76-alshaigy.pdf">PILeT: an Interactive Learning Tool To Teach Python</a>
              </li>
              <li className="collection-item">
                <a href="pdfs/p168-lasseter.pdf">The Interpreter In An Undergraduate Compilers Course</a>
              </li>
              <li className="collection-item">
                <a href="pdfs/p561-fossm.pdf">PLCC: A Programming Language Compiler Compiler</a>
              </li>
              <li className="collection-item">
                <a href="https://www.amazon.com/Compilers-Principles-Techniques-Tools-2nd/dp/0321486811">
                  Compilers: Principles, Techniques, and Tools (2nd Edition)
                </a>
              </li>
            </ul>
            <Typography variant='headline'>Planned Features</Typography>
            <ul className="collection">
              <li className="collection-item">
                Implement a Teacher Dashboard where
                <ul className="collection">
                  <li className="collection-item">The teacher can create a classroom</li>
                  <li className="collection-item">
                    Can create exercises which are can be configured disabling language features for example:
                    <ul className="collection">
                      <li className="collection-item">- while loops</li>
                      <li className="collection-item">- the creation of global variables</li>
                      <li className="collection-item">
                        - whitelisting/blacklisting of usable variable or function names
                      </li>
                      <li className="collection-item">- disabling the importation of certain modules</li>
                      <li className="collection-item">- limiting the number nested loops</li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li className="collection-item">
                Implement a Student Dashboard
                <ul className="collection">
                  <li className="collection-item">The student can join a classroom</li>
                  <li className="collection-item">View, edit and submit the extercises</li>
                </ul>
              </li>
            </ul>
            <div className="section scrollspy" id="resources">
              <Typography variant='headline'>Resources</Typography>
              <h4>
               Javascript and <a href="https://nodejs.org">
                  NodeJs
                </a>
              </h4>
              <p className="flow-text">This application is written in Javascript running in Node.js enviroment</p>
              <h4>
                <a href="https://expressjs.com">ExpressJs</a>
              </h4>
              <p className="flow-text">It runs using express.js web framework for frontend and backend.</p>
              <h4>
                <a href="https://material-ui-next.com/">Material UI</a>
              </h4>
              <p className="flow-text">The design is created with Material-UI library.</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
});
