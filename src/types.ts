export type Author = {
  login: string;
  fullName: string;
};

export type Task = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  runId?: string;
};
