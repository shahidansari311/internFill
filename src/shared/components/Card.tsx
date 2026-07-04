import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import './Card.css';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'gradient';
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  variant = 'default',
  onClick,
}: CardProps) {
  return (
    <motion.div
      className={`card card-${variant} card-p-${padding} ${hoverable ? 'card-hoverable' : ''} ${onClick ? 'card-clickable' : ''} ${className}`}
      whileHover={hoverable ? { y: -2, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </motion.div>
  );
}
