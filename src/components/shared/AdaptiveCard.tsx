import React, { ReactNode } from 'react';
import Card, { CardProps } from '@/components/ui/Card';

export interface AdaptiveCardProps extends CardProps {
  children?: ReactNode;
}

export default function AdaptiveCard({
  className = '',
  bodyClass = '',
  ...rest
}: AdaptiveCardProps) {
  return (
    <Card
      className={`card card-border shadow-xs bg-white ${className}`}
      bodyClass={bodyClass}
      {...rest}
    />
  );
}
