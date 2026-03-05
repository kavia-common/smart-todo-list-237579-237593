import React, { useMemo, useState } from "react";
import "../styles/composer.css";

function TodoComposer({ onAdd }) {
  const [text, setText] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = useMemo(() => text.trim(), [text]);
  const hasError = touched && trimmed.length === 0;

  function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
    setTouched(false);
  }

  return (
    <form className="composer" onSubmit={submit} aria-label="Add a new task">
      <div className="composerRow">
        <label className="srOnly" htmlFor="newTodo">
          Add a task
        </label>
        <input
          id="newTodo"
          className={`composerInput ${hasError ? "composerInputError" : ""}`}
          placeholder="Add a task…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setTouched(true)}
          inputMode="text"
          autoComplete="off"
        />
        <button className="primaryButton" type="submit">
          Add
        </button>
      </div>

      {hasError ? (
        <div className="inlineError" role="alert">
          Task text can’t be empty.
        </div>
      ) : null}
    </form>
  );
}

export default TodoComposer;
