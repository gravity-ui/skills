export type Page = "dashboard" | "tasks" | "settings";

export type Task = {
  id: number;
  title: string;
  status: "todo" | "done";
};
