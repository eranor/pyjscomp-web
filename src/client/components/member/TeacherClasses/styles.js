export const styles = (theme) => ({
  root: theme.mixins.gutters({
    paddingTop: theme.spacing.unit * 1,
    position: 'relative',
    height: '100%',
    width: '100%',
    maxWidth: '960px',
    marginLeft: 'auto',
    marginRight: 'auto',
  }),
  content: {
    display: 'grid',
    gridTemplateRows: '1fr min-content',
  },
  pagination: {
    padding: 0,
    display: 'grid',
    justifyContent: 'center',
    gridAutoFlow: 'column',
    gridAutoColumns: 'min-content',
  },
  previous: {
    listStyle: 'none',
  },
  page: {
    listStyle: 'none',
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '8px',
    fontSize: '0.875rem',
    minWidth: '44px',
    boxSizing: 'border-box',
    minHeight: '36px',
    transition:
      'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    fontWeight: 500,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: '1.4em',
    borderRadius: '2px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
    },
    display: 'inherit',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageLink: {
    width: '100%',
    height: '100%',
    margin: '0 auto',
    textAlign: 'center',
  },
  button: {
    marginBottom: theme.spacing.unit,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
  },
  newClassButton: {
    margin: '0 auto',
    marginTop: theme.spacing.unit * 3,
  },
  newClassDialog: {
    display: 'grid',
    gridAutoFlow:'row',
    gridAutoRows: '1fr',
    gridRowGap: `${theme.spacing.unit}px`
  },
});
