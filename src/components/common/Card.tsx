import type { ReactNode } from 'react';
import styles from './Card.module.css';

export function Card({ title, children, actions }: { title: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

