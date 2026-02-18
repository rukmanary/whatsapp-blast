import '@testing-library/jest-dom';

import * as React from 'react';

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(async () => undefined),
  },
});

jest.mock('lucide-react', () => {
  const Icon = (props: Record<string, unknown>) => React.createElement('svg', props);
  return {
    Download: Icon,
    Copy: Icon,
    Send: Icon,
    FileUp: Icon,
    FileText: Icon,
    Wand2: Icon,
    AlertTriangle: Icon,
    RefreshCcw: Icon,
  };
});
