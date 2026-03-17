import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

function ButtonGroup_Eixos() {
  const [activeButton, setActiveButton] = useState(0); // Inicializa com 0 para "Rascunho" pré-selecionado

  const handleButtonClick = (index) => {
    setActiveButton(index);
  };

  return (
    <ButtonGroup aria-label="Basic example">
      <Button
        variant={activeButton === 0 ? "success" : "light"}
        onClick={() => handleButtonClick(0)}
        style={{ color: activeButton === 0 ? "black" : "black" }}
      >
        Rascunho
      </Button>
      <Button
        variant={activeButton === 1 ? "success" : "light"}
        onClick={() => handleButtonClick(1)}
        style={{ color: activeButton === 1 ? "black" : "black" }}
      >
        Configuradas
      </Button>
      <Button
        variant={activeButton === 2 ? "success" : "light"}
        onClick={() => handleButtonClick(2)}
        style={{ color: activeButton === 2 ? "black" : "black" }}
      >
        Enviadas
      </Button>
      <Button
        variant={activeButton === 3 ? "success" : "light"}
        onClick={() => handleButtonClick(3)}
        style={{ color: activeButton === 3 ? "black" : "black" }}
      >
        Encerradas
      </Button>
    </ButtonGroup>
  );
}

export default ButtonGroup_Eixos;
