import React from 'react';
import Email from 'mdi-material-ui/Email';
import GithubBox from 'mdi-material-ui/GithubBox';
import Twitter from 'mdi-material-ui/Twitter';
import Web from 'mdi-material-ui/Web';
import Typography from 'material-ui/Typography';
import withStyles from 'material-ui/styles/withStyles';
import classNames from 'classnames';

const styles = (theme) => ({
  root: theme.mixins.gutters({
    display: 'grid',
    [theme.breakpoints.up('sm')]: {
      gridTemplateAreas: "'contacts links' 'copyright copyright'",
    },
    [theme.breakpoints.down('xs')]: {
      gridTemplateAreas: "'contacts' 'links' 'copyright'",
    },
  }),

  footerItem: {
    display: 'grid',
    [theme.breakpoints.up('xl')]: {
      alignItems: 'start',
      gridAutoFlow: 'column',
      gridColumnGap: `${theme.spacing.unit}px`,
      gridAutoColumns: 'min-content',
    },
    [theme.breakpoints.between('sm', 'lg')]: {
      gridAutoFlow: 'row',
      gridAutoColumns: '1fr',
    },
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: '1fr',
    },
  },
  contacts: {
    gridArea: 'contacts',
  },
  links: {
    gridArea: 'links',
  },
  copyright: {
    gridArea: 'copyright',
    justifySelf: 'end',
  },
  contactsItem: {
    '& aside, & span': {
      paddingLeft: theme.spacing.unit * 2,
    },
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
  },
  icon: {
    fontSize: theme.typography.body1.fontSize,
  },
});

export const Footer = withStyles(styles)((props) => {
  const { root, contacts, links, footerItem, copyright, contactsItem, icon } = props.classes;
  const contactsClassName = classNames(footerItem, contacts);
  const linksClassName = classNames(footerItem, links);
  return (
    <footer className={root}>
      <div className={contactsClassName}>
        <Typography variant="subheading">Contacts</Typography>
        <div className={contactsItem}>
          <Email className={icon} />
          <Typography variant="body2">Email:</Typography>
          <Typography variant="body1" noWrap>
            akoshervay (at) gmail.com
          </Typography>
        </div>
        <div className={contactsItem}>
          <Twitter className={icon} />
          <Typography variant="body2">Twitter:</Typography>
          <Typography variant="body1">
            <a href="https://twitter.com/asyzard">https://twitter.com/asyzard</a>
          </Typography>
        </div>
      </div>
      <div className={linksClassName}>
        <Typography variant="subheading">Links</Typography>
        <div className={contactsItem}>
          <Web className={icon} />
          <Typography variant="body2">Website:</Typography>
          <Typography variant="body1">
            <a href=" http://eranor.me">http://eranor.me</a>
          </Typography>
        </div>
        <div className={contactsItem}>
          <GithubBox className={icon} />
          <Typography variant="body2">Github:</Typography>
          <Typography variant="body1">
            <a href="https://github.com/eranor">https://github.com/eranor</a>
          </Typography>
        </div>
      </div>
      <Typography className={copyright}>&copy; 2017 Copyright Ákos Hervay</Typography>
    </footer>
  );
});
