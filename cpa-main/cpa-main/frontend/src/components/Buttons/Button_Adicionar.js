import React from 'react'
import './Button.css'

const ButtonAdicionar = ({ onClick, children}) =>{
    return(
        <button className="button-add-item" onClick={onClick}>
            {children}
        </button>
    );
};

export default ButtonAdicionar