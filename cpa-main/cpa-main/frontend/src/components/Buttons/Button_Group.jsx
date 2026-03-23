// recebe callback onFiltroChange e comunica o status selecionado
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

// ADICIONADO: mapeamento de índice para valor de status
// null = todos, 1 = rascunho, 2 = enviada, 3 = encerrada
const FILTROS = [
    { label: 'Todos',      status: null },
    { label: 'Rascunho',   status: 1    },
    { label: 'Enviadas',   status: 2    },
    { label: 'Encerradas', status: 3    },
];

function ButtonGroup_Eixos({ onFiltroChange }) { // ADICIONADO: prop onFiltroChange
    const [activeButton, setActiveButton] = useState(0);

    const handleButtonClick = (index) => {
        setActiveButton(index);
        // ADICIONADO: comunica o status selecionado para o componente pai
        if (onFiltroChange) {
            onFiltroChange(FILTROS[index].status);
        }
    };

    return (
        <ButtonGroup aria-label="Filtro de avaliações">
            {FILTROS.map((filtro, index) => (
                <Button
                    key={index}
                    variant={activeButton === index ? 'success' : 'light'}
                    onClick={() => handleButtonClick(index)}
                    style={{ color: 'black' }}
                >
                    {filtro.label}
                </Button>
            ))}
        </ButtonGroup>
    );
}

export default ButtonGroup_Eixos;