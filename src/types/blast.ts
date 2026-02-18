export type CsvRow = Record<string, string>;

export type GeneratedMessage = {
  name: string;
  phone: string;
  message: string;
  link: string;
};

export type SavedTemplate = {
  id: string;
  text: string;
  createdAt: number;
};

export type InputMode = 'upload' | 'paste';
