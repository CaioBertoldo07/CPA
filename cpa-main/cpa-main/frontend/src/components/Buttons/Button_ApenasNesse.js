import React from 'react';
import './Button.css';


const ButtonApenasNesse = ({ onClick, children }) => {
  return (
    <button className="ButtonApenasNesse" onClick={onClick}>
      {children}
    </button>
  );
};

export default ButtonApenasNesse;