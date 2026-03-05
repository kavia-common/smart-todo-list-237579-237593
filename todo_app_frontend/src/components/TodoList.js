import React from "react";
import TodoItem from "./TodoItem";
import "../styles/list.css";

function TodoList({ todos, onToggle, onDelete, onEdit, emptyState }) {
  if (!todos.length) {
    return <div className="emptyState">{emptyState}</div>;
  }

  return (
    <ul className="todoList" aria-label="Todo items">
      {todos.map((t) => (
        <TodoItem
          key={t.id}
          todo={t}
          onToggle={() => onToggle(t.id)}
          onDelete={() => onDelete(t.id)}
          onEdit={(nextText) => onEdit(t.id, nextText)}
        />
      ))}
    </ul>
  );
}

export default TodoList;
