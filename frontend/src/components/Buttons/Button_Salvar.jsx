import React from 'react';
import './Button.css';


const ButtonSalvar = ({ onClick, children }) => {
  return (
    <button className="ButtonSalvar" onClick={onClick}>
      {children}
    </button>
  );
};

export default ButtonSalvar;