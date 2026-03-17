import React from 'react';
import { BiPlus, BiMinus } from "react-icons/bi";
import '../Modals/modalStyles.css'; // Importe o CSS

function DynamicInputs({ inputs, adicionarInput, removerInput, handleNumeroChange, handleNomeChange }) {
  return (
    <div>
      {inputs.map((input, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            value={input.numero}
            onChange={(e) => handleNumeroChange(index, e.target.value)}
            className="input-field"
            style={{ width: '80px' }} // Pequena caixa para número da dimensão
            placeholder="Número"
          />
          <input
            type="text"
            value={input.nome}
            onChange={(e) => handleNomeChange(index, e.target.value)}
            className="input-field"
            style={{ width: '200px' }} // Caixa maior para nome da dimensão
            placeholder="Nome"
          />
          {index > 0 && (
            <BiMinus onClick={() => removerInput(index)} style={{ cursor: 'pointer', fontSize: '20px' }} />
          )}
          {index === 0 && (
            <BiPlus onClick={adicionarInput} style={{ cursor: 'pointer', fontSize: '20px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default DynamicInputs;
