import React from 'react';
import withStyles from 'material-ui/styles/withStyles';

const styles = (theme) => ({
  root: {
    display: 'block',
  },
});

const ErrorText = withStyles(styles)((props) => {
  const { children, classes, ...otherProps } = props;
  return (
    <span className={classes.root} {...otherProps}>
      {children}
    </span>
  );
});

export const convertObjectToErrorText = (inputName, errors) => {
  let errorsObject = errors[inputName];
  let errorsArray = Object.values(errorsObject);
  return errorsArray.map((err, i) => <ErrorText key={i}>{err}</ErrorText>);
};
