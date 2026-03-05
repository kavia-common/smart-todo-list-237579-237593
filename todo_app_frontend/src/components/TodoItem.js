import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/item.css";

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(todo.text);
  }, [todo.text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const trimmedDraft = useMemo(() => draft.trim(), [draft]);
  const canSave = trimmedDraft.length > 0 && trimmedDraft !== todo.text;

  function startEdit() {
    setIsEditing(true);
  }

  function cancelEdit() {
    setDraft(todo.text);
    setIsEditing(false);
  }

  function commitEdit() {
    if (!trimmedDraft) return;
    if (trimmedDraft !== todo.text) {
      onEdit(trimmedDraft);
    }
    setIsEditing(false);
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  }

  return (
    <li className={`todoItem ${todo.completed ? "todoItemCompleted" : ""}`}>
      <button
        type="button"
        className={`checkButton ${todo.completed ? "checkButtonChecked" : ""}`}
        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        onClick={onToggle}
      >
        <span className="checkIcon" aria-hidden="true">
          ✓
        </span>
      </button>

      <div className="todoMain">
        {isEditing ? (
          <div className="editRow">
            <label className="srOnly" htmlFor={`edit-${todo.id}`}>
              Edit task
            </label>
            <input
              id={`edit-${todo.id}`}
              ref={inputRef}
              className="editInput"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={() => {
                // On blur, commit if valid; otherwise revert.
                if (trimmedDraft) commitEdit();
                else cancelEdit();
              }}
            />
            <button
              type="button"
              className="ghostButton"
              onClick={commitEdit}
              disabled={!trimmedDraft}
              aria-label="Save edit"
            >
              Save
            </button>
            <button
              type="button"
              className="ghostButton"
              onClick={cancelEdit}
              aria-label="Cancel edit"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="viewRow">
            <span className="todoText">{todo.text}</span>
            <div className="itemActions">
              <button
                type="button"
                className="ghostButton"
                onClick={startEdit}
                aria-label="Edit task"
              >
                Edit
              </button>
              <button
                type="button"
                className="dangerButton"
                onClick={onDelete}
                aria-label="Delete task"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="metaRow">
          <span className="metaText">
            {todo.completed ? "Completed" : "Active"}
          </span>
        </div>
      </div>
    </li>
  );
}

export default TodoItem;
