import React from 'react';
import './Button.css';


const ButtonTodos = ({ onClick, children }) => {
  return (
    <button className="ButtonTodos" onClick={onClick}>
      {children}
    </button>
  );
};

export default ButtonTodos;