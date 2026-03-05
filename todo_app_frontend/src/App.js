import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import TodoComposer from "./components/TodoComposer";
import TodoList from "./components/TodoList";
import FilterBar from "./components/FilterBar";
import {
  createTodo,
  deleteTodoById,
  toggleTodoById,
  updateTodoTextById,
  filterTodos,
} from "./lib/todos";
import { loadTodosFromStorage, saveTodosToStorage } from "./lib/storage";
import "./styles/app.css";

const STORAGE_KEY = "smart_todo_list.todos";

const FILTERS = ["all", "active", "completed"];

function App() {
  const [todos, setTodos] = useState(() => loadTodosFromStorage(STORAGE_KEY));
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    saveTodosToStorage(STORAGE_KEY, todos);
  }, [todos]);

  const counts = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }, [todos]);

  const visibleTodos = useMemo(() => filterTodos(todos, filter), [todos, filter]);

  function handleAdd(text) {
    setTodos((prev) => [createTodo(text), ...prev]);
  }

  function handleToggle(id) {
    setTodos((prev) => toggleTodoById(prev, id));
  }

  function handleDelete(id) {
    setTodos((prev) => deleteTodoById(prev, id));
  }

  function handleEdit(id, nextText) {
    setTodos((prev) => updateTodoTextById(prev, id, nextText));
  }

  function handleClearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  return (
    <div className="appShell">
      <Header subtitle="Create, organize, and finish tasks — with local persistence." />

      <main className="card" aria-label="Todo app">
        <TodoComposer onAdd={handleAdd} />

        <TodoList
          todos={visibleTodos}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={handleEdit}
          emptyState={
            filter === "completed"
              ? "No completed tasks yet."
              : filter === "active"
                ? "No active tasks — you're all caught up."
                : "No tasks yet. Add your first todo above."
          }
        />

        <FilterBar
          filter={filter}
          filters={FILTERS}
          counts={counts}
          onChangeFilter={setFilter}
          onClearCompleted={handleClearCompleted}
          clearCompletedDisabled={counts.completed === 0}
        />
      </main>

      <footer className="footer">
        <span className="footerText">
          Stored locally in your browser — no account required.
        </span>
      </footer>
    </div>
  );
}

export default App;
