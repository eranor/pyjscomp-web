import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import withStyles from 'material-ui/styles/withStyles';
import Table, { TableBody, TableCell, TableHead, TablePagination, TableRow, TableSortLabel } from 'material-ui/Table';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';
import DeleteIcon from 'material-ui-icons/Delete';
import Refresh from 'material-ui-icons/Refresh';
import { lighten } from 'material-ui/styles/colorManipulator';
import MoreHoriz from 'material-ui-icons/es/MoreHoriz';

const enhancedTableHeadStyle = (theme) => ({
  checkbox: {
    height: theme.spacing.unit * 3,
    width: theme.spacing.unit * 3,
  },
  tableCell: {
    padding: '4px 24px 4px 12px',
  },
});

@withStyles(enhancedTableHeadStyle)
class EnhancedTableHead extends React.Component {
  static propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
    hasCheckButton: PropTypes.bool,
  };

  static defaultProps = {
    hasCheckButton: true,
  };

  createSortHandler = (property) => (event) => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { onSelectAllClick, columnData, order, orderBy, numSelected, rowCount, hasCheckButton } = this.props;
    return (
      <TableHead>
        <TableRow>
          {hasCheckButton && (
            <TableCell padding="checkbox">
              <Checkbox
                className={this.props.classes.checkbox}
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={numSelected === rowCount}
                onChange={onSelectAllClick}
              />
            </TableCell>
          )}
          {columnData.map((column) => {
            return (
              <TableCell
                key={column.id}
                numeric={column.numeric}
                classes={{ root: this.props.classes.tableCell }}
                padding={column.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === column.id ? order : false}
              >
                <Tooltip title="Sort" placement={column.numeric ? 'bottom-end' : 'bottom-start'} enterDelay={300}>
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={order}
                    onClick={this.createSortHandler(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

const toolbarStyles = (theme) => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
});

let EnhancedTableToolbar = withStyles(toolbarStyles)((props) => {
  const { numSelected, classes, title, onRefreshClick, onDeleteClick } = props;

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subheading">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography variant="title">{title}</Typography>
        )}
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton onClick={onDeleteClick} aria-label="Delete">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Refresh">
            <IconButton onClick={onRefreshClick} aria-label="Refresh">
              <Refresh />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </Toolbar>
  );
});

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onDeleteClick: PropTypes.func,
  onFilterListClick: PropTypes.func,
};

const styles = (theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  tableRow: {
    height: theme.spacing.unit * 3,
  },
  checkbox: {
    height: theme.spacing.unit * 3,
    width: theme.spacing.unit * 3,
  },
  tableCell: {
    padding: '4px 24px 4px 12px',
  },
});

@withStyles(styles)
export class EnhancedTable extends React.Component {
  static propTypes = {
    classes: PropTypes.object,
    cells: PropTypes.array,
    tableData: PropTypes.array,
    onRowButtonClick: PropTypes.func,
    hasCheckButton: PropTypes.bool,
    defaults: PropTypes.shape({
      order: PropTypes.oneOf(['asc', 'desc']),
      orderBy: PropTypes.string,
      rowsPerPage: PropTypes.number,
    }),
  };

  static defaultProps = {
    hasCheckButton: true,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      order: this.props.defaults.order,
      orderBy: this.props.defaults.orderBy,
      selected: [],
      data: this.props.tableData || [],
      page: 0,
      rowsPerPage: this.props.defaults.rowsPerPage,
    };
  }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';
    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }
    const data =
      order === 'desc'
        ? this.state.data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
        : this.state.data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));
    this.setState({ data, order, orderBy });
  };

  handleSelectAllClick = (event, checked) => {
    if (checked) {
      this.setState({ selected: this.state.data.map((n) => n.id) });
      return;
    }
    this.setState({ selected: [] });
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    this.props.onSelected(newSelected);
    this.setState({ selected: newSelected });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected = (id) => this.state.selected.indexOf(id) !== -1;

  render() {
    const {
      classes,
      tableData: data,
      columnData,
      toolbarProps,
      onRowClick,
      onRowButtonClick,
      hasCheckButton,
      getIdFunction
    } = this.props;
    const { order, orderBy, selected, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar numSelected={selected.length} {...toolbarProps} />
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            <EnhancedTableHead
              columnData={columnData}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
            />
            <TableBody>
              {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((n, id) => {
                const rowId = !!getIdFunction ? getIdFunction(n) : n.id || id;
                const isSelected = this.isSelected(rowId);
                const hasCheckButtonProps = hasCheckButton ? { role: 'checkbox' } : {};
                return (
                  <TableRow
                    hover
                    onClick={hasCheckButton ? (event) => this.handleClick(event, rowId) : onRowClick}
                    className={classes.tableRow}
                    aria-checked={isSelected}
                    tabIndex={-1}
                    key={rowId}
                    selected={isSelected}
                    {...hasCheckButtonProps}
                  >
                    {hasCheckButton && (
                      <TableCell padding="checkbox">
                        <Checkbox className={classes.checkbox} checked={isSelected} />
                      </TableCell>
                    )}
                    {columnData.map(({ id, numeric, disablePadding }, i) => {
                      return (
                        <TableCell
                          classes={{ root: classes.tableCell }}
                          key={i}
                          numeric={numeric}
                          padding={disablePadding ? 'none' : 'default'}
                        >
                          {n[id]}
                        </TableCell>
                      );
                    })}
                    <TableCell padding="checkbox">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowButtonClick(n)(e);
                        }}
                      >
                        <MoreHoriz />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}
