import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  leftIcon?: ReactNode;
};

export function Button({ variant = 'secondary', leftIcon, className, children, ...rest }: Props) {
  const cls = [styles.btn, styles[variant], className].filter(Boolean).join(' ');
  return (
    <button {...rest} className={cls}>
      {leftIcon ? <span className={styles.iconWrap}>{leftIcon}</span> : null}
      <span>{children}</span>
    </button>
  );
}

