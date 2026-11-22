import { useState, type FormEvent } from "react";
import { Field } from "../components/Field";
import * as authService from "../services/authService";
import { getErrorMessage } from "../utils/errors";
import "./LoginPage.css";

type LoginPageProps = {
  onSuccess: () => void;
};

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [login, setLogin] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      await authService.login(login);
      onSuccess();
    } catch (err) {
      authService.logout();
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="brand login-card__brand">TodoList</p>
        <h1>Вход</h1>

        <div className="login-card__field">
          <Field
            id="login"
            label="Логин"
            value={login}
            onChange={setLogin}
            placeholder="your-login"
            autoFocus
            autoComplete="username"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary login-card__submit"
          disabled={pending || !login.trim()}
        >
          {pending ? "Входим…" : "Окей"}
        </button>

        {error ? <p className="error-text">{error}</p> : null}
      </form>
    </main>
  );
}
