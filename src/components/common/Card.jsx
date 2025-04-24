import React from 'react';
import classNames from 'classnames';

const Card = ({
  children,
  className,
  padding = 'normal',
  hover = false,
  onClick,
  ...props
}) => {
  const paddingStyles = {
    none: '',
    small: 'p-3',
    normal: 'p-4',
    large: 'p-6',
  };

  return (
    <div
      className={classNames(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
        paddingStyles[padding],
        hover && 'hover:shadow-md transition-shadow duration-200',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => (
  <div
    className={classNames('border-b border-gray-200 dark:border-gray-700 pb-3 mb-4', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3
    className={classNames('text-lg font-semibold text-gray-900 dark:text-white', className)}
    {...props}
  >
    {children}
  </h3>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={classNames('space-y-4', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div
    className={classNames(
      'border-t border-gray-200 dark:border-gray-700 pt-3 mt-4 flex items-center justify-between',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export default Card; 