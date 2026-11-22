import type { Task } from "../types";
import { TrashIcon } from "./TrashIcon";

type TaskListProps = {
  tasks: Task[];
  emptyText?: string;
  onDelete: (id: string) => void;
};

export function TaskList({
  tasks,
  emptyText = "Заданий пока нет",
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="task-list-empty muted">{emptyText}</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className="task-item">
          <div className="task-item__body">
            <strong>{task.title}</strong>
            <span className="muted">
              {task.id}
              {task.runId ? ` · ${task.runId}` : ""}
              {task.done ? " · выполнено" : ""}
            </span>
          </div>
          <button
            type="button"
            className="btn-danger-icon"
            aria-label={`Удалить задание ${task.title}`}
            onClick={() => onDelete(task.id)}
          >
            <TrashIcon />
          </button>
        </li>
      ))}
    </ul>
  );
}
