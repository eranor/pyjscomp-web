import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { NoLogin, NoMatch } from '@/components/error';
import { Account, Class, Classes, Editor, Home } from '@/components/member';
import { Landing } from '@/components/Landing';
import { About } from '@/components/About';
import { Solutions } from '@/components/member/Solutions';
//
// Explicitly pass down 'isAuthenticated' prop to ProtectedRoute

export const Routes = (props) => (
  <Switch props={props}>
    <Route exact path="/" component={Landing}/>
    <Route path="/about" component={About}/>
    <ProtectedRoute isAuthenticated={props.isAuthenticated} path="/classes" component={Classes}/>
    <ProtectedRoute
      isAuthenticated={props.isAuthenticated}
      path="/class/:classId"
      component={Class}
    />
    <ProtectedRoute isAuthenticated={props.isAuthenticated} path="/editor" component={Editor}/>
    <Route path="/login_error" component={NoLogin}/>
    <ProtectedRoute isAuthenticated={props.isAuthenticated} path="/account" component={Account}/>
    <ProtectedRoute isAuthenticated={props.isAuthenticated} path="/home" component={Home}/>
    <ProtectedRoute isAuthenticated={props.isAuthenticated} path="/solution/:userId" component={Solutions}/>
    <Route component={NoMatch}/>
  </Switch>
);
//
const ProtectedRoute = ({
                          component: Component,
                          // eslint-disable-next-line
                          isAuthenticated: isAuthenticated,
                          ...rest
                        }) => (
  <Route
    {...rest}
    render={(props) =>
      isAuthenticated ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login_error',
            state: { from: props.location },
          }}
        />
      )
    }
  />
);
