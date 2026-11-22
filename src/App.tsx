import { useEffect, useState, type FormEvent } from "react";
import {
  api,
  clearSession,
  getApiBase,
  getToken,
  setToken,
} from "./api";
import type { Author, Task } from "./types";

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export default function App() {
  const [login, setLogin] = useState("");
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [author, setAuthor] = useState<Author | null>(null);
  const [runId, setRunId] = useState("default");
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loginError, setLoginError] = useState("");
  const [appError, setAppError] = useState("");
  const [booting, setBooting] = useState(true);

  async function loadAuthor() {
    const data = await api<Author>("/api/author/");
    setAuthor(data);
  }

  async function loadTasks(currentRunId = runId) {
    setAppError("");
    const data = await api<Task[]>(
      `/api/tasks/?runId=${encodeURIComponent(currentRunId.trim())}`,
    );
    setTasks(data);
  }

  useEffect(() => {
    async function boot() {
      try {
        getApiBase();
      } catch (err) {
        setLoginError(getErrorMessage(err));
        setBooting(false);
        return;
      }

      if (!getToken()) {
        setBooting(false);
        return;
      }

      try {
        await loadAuthor();
        await loadTasks();
      } catch (err) {
        clearSession();
        setTokenState(null);
        setAuthor(null);
        setTasks([]);
        setLoginError(getErrorMessage(err));
      } finally {
        setBooting(false);
      }
    }

    void boot();
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    try {
      const value = await api<string>(
        `/login/?login=${encodeURIComponent(login.trim())}`,
      );
      const nextToken = String(value).trim();
      setToken(nextToken);
      setTokenState(nextToken);
      await loadAuthor();
      await loadTasks();
    } catch (err) {
      clearSession();
      setTokenState(null);
      setAuthor(null);
      setTasks([]);
      setLoginError(getErrorMessage(err));
    }
  }

  function handleLogout() {
    clearSession();
    setTokenState(null);
    setAuthor(null);
    setTasks([]);
    setAppError("");
    setLoginError("");
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppError("");

    try {
      await api("/api/tasks/", {
        method: "POST",
        body: JSON.stringify({
          title,
          runId: runId.trim(),
        }),
      });
      setTitle("");
      await loadTasks();
    } catch (err) {
      setAppError(getErrorMessage(err));
    }
  }

  async function handleToggleDone(id: string, done: boolean) {
    setAppError("");
    try {
      await api(`/api/tasks/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ done }),
      });
      await loadTasks();
    } catch (err) {
      setAppError(getErrorMessage(err));
      await loadTasks();
    }
  }

  async function handleDelete(id: string) {
    setAppError("");
    try {
      await api(`/api/tasks/${id}/`, { method: "DELETE" });
      await loadTasks();
    } catch (err) {
      setAppError(getErrorMessage(err));
    }
  }

  if (booting) {
    return (
      <>
        <h1>Todo List</h1>
        <p>Загрузка…</p>
      </>
    );
  }

  if (!token) {
    return (
      <>
        <h1>Todo List</h1>
        <section>
          <h2>Вход</h2>
          <form onSubmit={handleLogin}>
            <label>
              Логин
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </label>{" "}
            <button type="submit">Войти</button>
          </form>
          {loginError ? <p>{loginError}</p> : null}
        </section>
      </>
    );
  }

  return (
    <>
      <h1>Todo List</h1>

      <section>
        <h2>Автор</h2>
        <p>
          {author
            ? `${author.fullName} (${author.login})`
            : "—"}
        </p>
        <button type="button" onClick={handleLogout}>
          Выйти
        </button>
      </section>

      <section>
        <h2>Список дел</h2>
        <label>
          runId
          <input
            type="text"
            value={runId}
            onChange={(e) => setRunId(e.target.value)}
          />
        </label>{" "}
        <button
          type="button"
          onClick={() =>
            void loadTasks().catch((err) =>
              setAppError(getErrorMessage(err)),
            )
          }
        >
          Загрузить
        </button>

        <h3>Новое дело</h3>
        <form onSubmit={handleCreate}>
          <label>
            title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>{" "}
          <button type="submit">Создать</button>
        </form>

        <h3>Дела</h3>
        <ul>
          {tasks.length === 0 ? (
            <li>Пусто</li>
          ) : (
            tasks.map((task) => (
              <li key={task.id}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={(e) =>
                    void handleToggleDone(task.id, e.target.checked)
                  }
                />{" "}
                <span>{task.title}</span>{" "}
                <small>
                  ({task.id}, {task.createdAt})
                </small>{" "}
                <button
                  type="button"
                  onClick={() => void handleDelete(task.id)}
                >
                  Удалить
                </button>
              </li>
            ))
          )}
        </ul>
        {appError ? <p>{appError}</p> : null}
      </section>
    </>
  );
}
