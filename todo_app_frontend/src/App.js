import React, { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "smart_todo_list.todos.v1";

/**
 * @typedef {"all" | "active" | "completed"} Filter
 */

/**
 * @typedef Todo
 * @property {string} id
 * @property {string} text
 * @property {boolean} completed
 * @property {number} createdAt
 */

function createId() {
  // Good-enough client-side ID for a local-only app.
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Attempt to load todos from localStorage. Falls back to an empty list.
 * Keeps defensive parsing so corrupted storage doesn't break the app.
 */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && typeof t === "object")
      .map((t) => ({
        id: typeof t.id === "string" ? t.id : createId(),
        text: typeof t.text === "string" ? t.text : "",
        completed: Boolean(t.completed),
        createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
      }))
      .filter((t) => t.text.trim().length > 0 || t.completed === true); // be forgiving
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Ignore storage write errors (private browsing/quota) to keep UX functional.
  }
}

// PUBLIC_INTERFACE
export default function App() {
  /** @type {[Todo[], Function]} */
  const [todos, setTodos] = useState(() => loadTodos());
  /** @type {[Filter, Function]} */
  const [filter, setFilter] = useState("all");
  const [newText, setNewText] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const visibleTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed);
      case "completed":
        return todos.filter((t) => t.completed);
      case "all":
      default:
        return todos;
    }
  }, [todos, filter]);

  const counts = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }, [todos]);

  function addTodo(e) {
    e.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed) return;

    /** @type {Todo} */
    const next = {
      id: createId(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    };

    setTodos((prev) => [next, ...prev]);
    setNewText("");
    inputRef.current?.focus?.();
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTodoText(id, text) {
    const trimmed = text.trim();
    if (!trimmed) return false; // invalid update
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t)));
    return true;
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  function toggleAllVisibleCompleted() {
    // If filter is active/completed, only toggles visible items (a sensible UX)
    const ids = new Set(visibleTodos.map((t) => t.id));
    const allVisibleCompleted = visibleTodos.length > 0 && visibleTodos.every((t) => t.completed);

    setTodos((prev) =>
      prev.map((t) => {
        if (!ids.has(t.id)) return t;
        return { ...t, completed: !allVisibleCompleted };
      })
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="logo" aria-hidden="true">
            <span className="logoDot" />
          </div>
          <div>
            <h1>Smart Todo List</h1>
            <p className="subtitle">Stay focused. Keep it simple.</p>
          </div>
        </div>
      </header>

      <main className="main" role="main">
        <section className="card" aria-label="Todo list">
          <form className="addForm" onSubmit={addTodo}>
            <label className="srOnly" htmlFor="newTodo">
              Add a task
            </label>
            <input
              id="newTodo"
              ref={inputRef}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Add a task…"
              className="addInput"
              autoComplete="off"
              inputMode="text"
            />
            <button className="primaryBtn" type="submit" disabled={!newText.trim()}>
              Add
            </button>
          </form>

          <div className="toolbar" role="region" aria-label="Todo controls">
            <div className="counts" aria-live="polite">
              <span className="pill">
                <strong>{counts.active}</strong> active
              </span>
              <span className="pill subtle">
                <strong>{counts.completed}</strong> completed
              </span>
              <span className="pill subtle">
                <strong>{counts.total}</strong> total
              </span>
            </div>

            <div className="toolbarActions">
              <button
                type="button"
                className="ghostBtn"
                onClick={toggleAllVisibleCompleted}
                disabled={visibleTodos.length === 0}
                title="Toggle completion for visible items"
              >
                Toggle visible
              </button>
              <button
                type="button"
                className="dangerBtn"
                onClick={clearCompleted}
                disabled={counts.completed === 0}
                title="Remove all completed items"
              >
                Clear completed
              </button>
            </div>
          </div>

          <FilterBar filter={filter} setFilter={setFilter} />

          <ul className="list" aria-label="Todos">
            {visibleTodos.length === 0 ? (
              <li className="empty">
                <div className="emptyTitle">Nothing here.</div>
                <div className="emptyText">
                  {filter === "all"
                    ? "Add a task above to get started."
                    : "Try switching filters to see other tasks."}
                </div>
              </li>
            ) : (
              visibleTodos.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                  onSave={(text) => updateTodoText(todo.id, text)}
                />
              ))
            )}
          </ul>

          <footer className="footer">
            <span className="hint">
              Tip: Double-click a task to edit. Press Enter to save, Esc to cancel.
            </span>
          </footer>
        </section>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function FilterBar({ filter, setFilter }) {
  /** @type {Array<{id: Filter, label: string}>} */
  const filters = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <div className="filters" role="tablist" aria-label="Filter todos">
      {filters.map((f) => {
        const selected = filter === f.id;
        return (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={selected ? "filterBtn active" : "filterBtn"}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

// PUBLIC_INTERFACE
function TodoRow({ todo, onToggle, onDelete, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);

  const editRef = useRef(null);

  useEffect(() => {
    // Keep draft in sync if todo changes externally.
    setDraft(todo.text);
  }, [todo.text]);

  useEffect(() => {
    if (isEditing) {
      // Focus input after render when entering edit mode.
      setTimeout(() => editRef.current?.focus?.(), 0);
    }
  }, [isEditing]);

  function beginEdit() {
    setIsEditing(true);
    setDraft(todo.text);
  }

  function cancelEdit() {
    setIsEditing(false);
    setDraft(todo.text);
  }

  function commitEdit() {
    const ok = onSave(draft);
    if (!ok) return; // keep editing until valid
    setIsEditing(false);
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  }

  return (
    <li className={todo.completed ? "row completed" : "row"}>
      <button
        type="button"
        className={todo.completed ? "check checked" : "check"}
        onClick={onToggle}
        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        title={todo.completed ? "Mark incomplete" : "Mark complete"}
      >
        <span aria-hidden="true">{todo.completed ? "✓" : ""}</span>
      </button>

      <div className="content" onDoubleClick={beginEdit}>
        {!isEditing ? (
          <div className="text" title="Double-click to edit">
            {todo.text}
          </div>
        ) : (
          <div className="editWrap">
            <label className="srOnly" htmlFor={`edit-${todo.id}`}>
              Edit todo
            </label>
            <input
              id={`edit-${todo.id}`}
              ref={editRef}
              className="editInput"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={commitEdit}
              autoComplete="off"
            />
            <div className="editHelp" aria-hidden="true">
              Enter to save • Esc to cancel
            </div>
          </div>
        )}
      </div>

      <div className="rowActions">
        {!isEditing ? (
          <button type="button" className="ghostBtn small" onClick={beginEdit}>
            Edit
          </button>
        ) : (
          <button type="button" className="ghostBtn small" onClick={cancelEdit}>
            Cancel
          </button>
        )}
        <button type="button" className="dangerBtn small" onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  );
}
