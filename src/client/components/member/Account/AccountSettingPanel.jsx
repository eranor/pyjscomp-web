import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from 'material-ui/styles/withStyles';
import ExpansionPanel from 'material-ui/es/ExpansionPanel/ExpansionPanel';
import ExpansionPanelSummary from 'material-ui/es/ExpansionPanel/ExpansionPanelSummary';
import Typography from 'material-ui/es/Typography/Typography';
import ExpansionPanelDetails from 'material-ui/es/ExpansionPanel/ExpansionPanelDetails';
import ExpansionPanelActions from 'material-ui/es/ExpansionPanel/ExpansionPanelActions';
import Button from 'material-ui/es/Button/Button';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';

const styles = (theme) => ({});

@withStyles(styles)
export class AccountSettingPanel extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    detailsClass: PropTypes.object,
    heading: PropTypes.string,
    buttonText: PropTypes.string,
    buttonProps: PropTypes.object,
    children: PropTypes.node,
  };
  static defaultProps = {
    buttonText: 'Save',
  };

  state = {
    mobile: false,
  };

  componentDidMount() {
    window.addEventListener('resize', this.resize.bind(this));
    this.resize();
  }

  resize() {
    this.setState({ mobile: window.innerWidth <= 760 });
  }

  expansionPanelProps = (id) => {
    const { handleChange, expanded } = this.props.onChange(id);
    if (this.state.mobile) {
      return { expanded: expanded === id, onChange: handleChange };
    } else {
      return { expanded: true, defaultExpanded: true };
    }
  };

  render() {
    const { classes, name, heading, children, buttonProps, buttonText, detailsClass } = this.props;
    const { mobile } = this.state;
    const expansionSummaryProps = mobile ? { expandIcon: <ExpandMoreIcon /> } : {};
    return (
      <div className={classes.root}>
        <ExpansionPanel {...this.expansionPanelProps(name)}>
          <ExpansionPanelSummary {...expansionSummaryProps}>
            <Typography variant="title">{heading}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={detailsClass}>{children}</ExpansionPanelDetails>
          <ExpansionPanelActions>
            <Button variant="raised" {...buttonProps}>
              {buttonText}
            </Button>
          </ExpansionPanelActions>
        </ExpansionPanel>
      </div>
    );
  }
}
