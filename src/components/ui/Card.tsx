import React, { ReactNode, MouseEvent } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  bordered?: boolean;
  clickable?: boolean;
  bodyClass?: string;
  header?: {
    content?: string | ReactNode;
    extra?: ReactNode;
    bordered?: boolean;
    className?: string;
  };
  footer?: {
    content?: string | ReactNode;
    bordered?: boolean;
    className?: string;
  };
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export default function Card({
  children,
  className = '',
  bordered = true,
  clickable = false,
  bodyClass = '',
  header,
  footer,
  onClick,
  ...rest
}: CardProps) {
  const cardBorderClass = bordered ? 'card-border' : 'card-shadow';
  const cardClickableClass = clickable ? 'cursor-pointer select-none hover:border-gray-300 transition-colors' : '';

  return (
    <div
      className={`card ${cardBorderClass} ${cardClickableClass} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {header?.content && (
        <div
          className={`card-header ${header.bordered !== false ? 'card-header-border' : ''} ${
            header.extra ? 'card-header-extra' : ''
          } ${header.className || ''}`}
        >
          {typeof header.content === 'string' ? (
            <h4 className="text-sm font-bold text-gray-900">{header.content}</h4>
          ) : (
            header.content
          )}
          {header.extra && <span>{header.extra}</span>}
        </div>
      )}

      <div className={`card-body ${bodyClass}`}>{children}</div>

      {footer?.content && (
        <div
          className={`card-footer ${footer.bordered !== false ? 'card-footer-border' : ''} ${
            footer.className || ''
          }`}
        >
          {footer.content}
        </div>
      )}
    </div>
  );
}
