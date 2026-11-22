import { useCallback, useEffect, useState } from "react";
import { getApiBase, getToken } from "./api";
import { LoginPage } from "./pages/LoginPage";
import { TasksPage } from "./pages/TasksPage";
import { getErrorMessage } from "./utils/errors";

type Screen = "boot" | "login" | "tasks";

export default function App() {
  const [screen, setScreen] = useState<Screen>("boot");
  const [bootError, setBootError] = useState("");

  useEffect(() => {
    try {
      getApiBase();
      setScreen(getToken() ? "tasks" : "login");
    } catch (err) {
      setBootError(getErrorMessage(err));
      setScreen("login");
    }
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setScreen("tasks");
  }, []);

  const handleLogout = useCallback(() => {
    setScreen("login");
  }, []);

  if (screen === "boot") {
    return (
      <main className="app-shell">
        <p className="muted">Загрузка…</p>
      </main>
    );
  }

  if (screen === "login") {
    return (
      <>
        {bootError ? (
          <p className="error-text" style={{ textAlign: "center", padding: "1rem" }}>
            {bootError}
          </p>
        ) : null}
        <LoginPage onSuccess={handleLoginSuccess} />
      </>
    );
  }

  return <TasksPage onLogout={handleLogout} />;
}
