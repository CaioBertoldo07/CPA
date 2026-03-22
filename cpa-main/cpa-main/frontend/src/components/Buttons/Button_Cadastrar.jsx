import React from 'react';
import './Button.css';


const ButtonCadastrar = ({ onClick, children }) => {
  return (
    <button className="buttonCadastrar" onClick={onClick}>
      {children}
    </button>
  );
};

export default ButtonCadastrar;