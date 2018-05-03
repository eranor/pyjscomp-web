import React from 'react';
import Typography from 'material-ui/es/Typography/Typography';
import LinearProgress from 'material-ui/es/Progress/LinearProgress';

export const Loading = (props) => {
  if (props.error) {
    return <div>Error!</div>;
  } else if (props.pastDelay) {
    return (
      <div>
        <Typography>Loading... </Typography>
        <LinearProgress variant="query" />
      </div>
    );
  } else {
    return null;
  }
};
