import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { App } from './components/App';
import CssBaseline from 'material-ui/CssBaseline';
import { createConsoleStore } from '@/utils';

createConsoleStore()

function Main() {
  return (
    <BrowserRouter>
      <React.Fragment>
        <CssBaseline />
        <App />
      </React.Fragment>
    </BrowserRouter>
  );
}

ReactDOM.render(<Main />, document.querySelector('#app'));
