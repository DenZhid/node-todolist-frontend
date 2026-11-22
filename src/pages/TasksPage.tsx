import { useEffect, useState, type FormEvent } from "react";
import { Field } from "../components/Field";
import { TaskList } from "../components/TaskList";
import "../components/TaskList.css";
import * as authorService from "../services/authorService";
import * as authService from "../services/authService";
import * as tasksService from "../services/tasksService";
import type { Author, Task } from "../types";
import { getErrorMessage } from "../utils/errors";
import "./TasksPage.css";

type TasksPageProps = {
  onLogout: () => void;
};

export function TasksPage({ onLogout }: TasksPageProps) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [bootError, setBootError] = useState("");
  const [actionError, setActionError] = useState("");
  const [booting, setBooting] = useState(true);

  const [createTitle, setCreateTitle] = useState("");
  const [createRunId, setCreateRunId] = useState("");

  const [updateId, setUpdateId] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateRunId, setUpdateRunId] = useState("");

  const [listRunId, setListRunId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function boot() {
      try {
        const data = await authorService.getAuthor();
        setAuthor(data);
      } catch (err) {
        setBootError(getErrorMessage(err));
        authService.logout();
        onLogout();
      } finally {
        setBooting(false);
      }
    }

    void boot();
  }, [onLogout]);

  function clearFetchFields() {
    setListRunId("");
    setTaskId("");
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");

    try {
      await tasksService.createTask({
        title: createTitle,
        runId: createRunId.trim(),
      });
      setCreateTitle("");
      setCreateRunId("");
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");

    const payload: { title?: string; runId?: string } = {};
    if (updateTitle.trim()) {
      payload.title = updateTitle.trim();
    }
    if (updateRunId.trim()) {
      payload.runId = updateRunId.trim();
    }

    try {
      await tasksService.updateTask(updateId.trim(), payload);
      setUpdateId("");
      setUpdateTitle("");
      setUpdateRunId("");
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleListByRunId(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");

    try {
      const data = await tasksService.listTasksByRunId(listRunId);
      setTasks(data);
      clearFetchFields();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleGetById(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");

    try {
      const task = await tasksService.getTaskById(taskId);
      setTasks([task]);
      clearFetchFields();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    setActionError("");
    try {
      await tasksService.deleteTask(id);
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  function handleLogoutClick() {
    authService.logout();
    onLogout();
  }

  if (booting) {
    return (
      <main className="app-shell tasks-page">
        <p className="muted">Загрузка профиля…</p>
      </main>
    );
  }

  return (
    <main className="app-shell tasks-page">
      <header className="tasks-header">
        <div>
          <p className="brand tasks-header__brand">TodoList</p>
          <h1>Рабочая панель</h1>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleLogoutClick}
        >
          Выйти
        </button>
      </header>

      <section className="section-block user-card">
        <h2>Пользователь</h2>
        {author ? (
          <div className="user-card__meta">
            <strong>{author.fullName}</strong>
            <span className="muted">@{author.login}</span>
          </div>
        ) : (
          <p className="muted">Профиль недоступен</p>
        )}
        {bootError ? <p className="error-text">{bootError}</p> : null}
      </section>

      <div className="pair-grid">
        <section className="section-block">
          <h2>Создать задание</h2>
          <form onSubmit={handleCreate}>
            <div className="form-row two-cols">
              <Field
                id="create-title"
                label="title"
                value={createTitle}
                onChange={setCreateTitle}
                placeholder="Купить молоко"
              />
              <Field
                id="create-run-id"
                label="runId"
                value={createRunId}
                onChange={setCreateRunId}
                placeholder="sprint-12"
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!createTitle.trim() || !createRunId.trim()}
              >
                Создать
              </button>
            </div>
          </form>
        </section>

        <section className="section-block">
          <h2>Обновить задание</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-row">
              <Field
                id="update-id"
                label="id"
                value={updateId}
                onChange={setUpdateId}
                placeholder="uuid задания"
              />
            </div>
            <div className="form-row two-cols">
              <Field
                id="update-title"
                label="title"
                value={updateTitle}
                onChange={setUpdateTitle}
                placeholder="Новый заголовок"
              />
              <Field
                id="update-run-id"
                label="runId"
                value={updateRunId}
                onChange={setUpdateRunId}
                placeholder="sprint-12"
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  !updateId.trim() ||
                  (!updateTitle.trim() && !updateRunId.trim())
                }
              >
                Обновить
              </button>
            </div>
          </form>
        </section>
      </div>

      <div className="pair-grid">
        <section className="section-block">
          <h2>Получить все задания по runId</h2>
          <form onSubmit={handleListByRunId}>
            <div className="form-row">
              <Field
                id="list-run-id"
                label="runId"
                value={listRunId}
                onChange={setListRunId}
                placeholder="sprint-12"
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!listRunId.trim()}
              >
                Получить
              </button>
            </div>
          </form>
        </section>

        <section className="section-block">
          <h2>Получить по id</h2>
          <form onSubmit={handleGetById}>
            <div className="form-row">
              <Field
                id="get-task-id"
                label="id"
                value={taskId}
                onChange={setTaskId}
                placeholder="uuid задания"
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!taskId.trim()}
              >
                Получить
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="section-block results-block">
        <h2>Результат</h2>
        <TaskList tasks={tasks} onDelete={(id) => void handleDelete(id)} />
        {actionError ? <p className="error-text">{actionError}</p> : null}
      </section>
    </main>
  );
}
