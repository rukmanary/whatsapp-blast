import { RefreshCcw, Wand2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useBlast } from '@/context/BlastContext';
import styles from './GeneratorActions.module.css';

export function GeneratorActions() {
  const { generate, resetAll, isParsing } = useBlast();

  return (
    <div className={styles.row}>
      <Button type="button" variant="primary" leftIcon={<Wand2 size={16} />} onClick={generate} disabled={isParsing}>
        Generate
      </Button>
      <Button type="button" variant="secondary" leftIcon={<RefreshCcw size={16} />} onClick={resetAll}>
        Reset
      </Button>
    </div>
  );
}

