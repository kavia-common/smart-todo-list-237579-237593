import React from "react";
import "../styles/header.css";

function Header({ subtitle }) {
  return (
    <header className="header">
      <div className="headerInner">
        <div>
          <h1 className="title">Smart Todo List</h1>
          <p className="subtitle">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
