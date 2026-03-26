import React from 'react';
import './Button.css';


const ButtonCancelar = ({ onClick, children }) => {
  return (
    <button className="buttonCancelar" onClick={onClick}>
      {children}
    </button>
  );
};

export default ButtonCancelar;