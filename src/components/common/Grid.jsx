import React from 'react';
import classNames from 'classnames';

const Grid = ({
  children,
  className,
  cols = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
  },
  gap = 6,
  ...props
}) => {
  const getGridCols = () => {
    const colClasses = [];
    if (cols.default) colClasses.push(`grid-cols-${cols.default}`);
    if (cols.sm) colClasses.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`);
    return colClasses.join(' ');
  };

  return (
    <div
      className={classNames(
        'grid',
        getGridCols(),
        `gap-${gap}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const GridItem = ({ children, className, ...props }) => (
  <div className={classNames('min-w-0', className)} {...props}>
    {children}
  </div>
);

export default Grid; 