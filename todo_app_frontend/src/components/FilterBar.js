import React from "react";
import "../styles/filterbar.css";

function labelFor(filter) {
  if (filter === "all") return "All";
  if (filter === "active") return "Active";
  return "Completed";
}

function FilterBar({
  filter,
  filters,
  counts,
  onChangeFilter,
  onClearCompleted,
  clearCompletedDisabled,
}) {
  return (
    <section className="filterBar" aria-label="Filters">
      <div className="filterGroup" role="tablist" aria-label="Todo filters">
        {filters.map((f) => {
          const active = f === filter;
          const count =
            f === "all" ? counts.total : f === "active" ? counts.active : counts.completed;

          return (
            <button
              key={f}
              type="button"
              className={`filterButton ${active ? "filterButtonActive" : ""}`}
              onClick={() => onChangeFilter(f)}
              role="tab"
              aria-selected={active}
            >
              <span>{labelFor(f)}</span>
              <span className="pill" aria-label={`${count} items`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="ghostButton"
        onClick={onClearCompleted}
        disabled={clearCompletedDisabled}
        aria-label="Clear completed tasks"
      >
        Clear completed
      </button>
    </section>
  );
}

export default FilterBar;
