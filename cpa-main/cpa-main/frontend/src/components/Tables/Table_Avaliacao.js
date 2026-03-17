import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { TfiMore } from 'react-icons/tfi';
import styled from 'styled-components';
import { FaTrash } from "react-icons/fa6";
import { IoEyeOutline } from "react-icons/io5";
import { BsUpload } from "react-icons/bs";
import { getAvaliacoes } from '../../services/avaliacoesService'; // Importa a função do serviço

const TableContainer = styled.div`
  margin: 20px;
`;

const OptionsMenu = styled.div`
  position: absolute;
  width: 125px;
  background-color: white;
  border: 1px solid #ccc;
  padding: 5px;
  display: ${({ visible }) => (visible ? 'block' : 'none')};
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
`;

const Option = styled.div`
  padding: 5px 0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const Table_Avaliacao = () => {
  const [avaliacoes, setAvaliacoes] = useState([]); // Estado para armazenar as avaliações
  const [menuVisible, setMenuVisible] = useState(null);

  // Carrega as avaliações ao montar o componente
  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        const data = await getAvaliacoes(); // Faz a requisição usando o service
        console.log('Avaliações recebidas:', data); // Debugging: Verificando a estrutura dos dados
        setAvaliacoes(data); // Atualiza o estado com os dados da API
      } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
      }
    };

    fetchAvaliacoes();
  }, []);

  const handleMoreClick = (index) => {
    setMenuVisible(menuVisible === index ? null : index);
  };

  const handleOptionClick = (option) => {
    alert(option);
    setMenuVisible(null); // Fecha o menu após clicar em uma opção
  };

  return (
    <TableContainer>
      <Table striped>
        <thead>
          <tr>
            <th>Código</th>
            <th>Modalidades</th> {/* Título da coluna Modalidades */}
            <th>Período letivo</th>
            <th>Ano</th>
            <th>Início</th>
            <th>Fim</th>
            <th>Opções</th>
          </tr>
        </thead>
        <tbody>
          {avaliacoes.map((item, index) => (
            <tr key={index}>
              <td>{item.codigo}</td>
              <td>
                {/* Se a avaliação tem modalidades, exibe os nomes das modalidades */}
                {item.modalidades && item.modalidades.length > 0
                  ? item.modalidades.map((modalidade, idx) => (
                    <span key={idx}>
                      {modalidade.mod_ensino}{idx < item.modalidades.length - 1 ? ', ' : ''}
                    </span>
                  ))
                  : 'N/A'}
              </td>
              <td>{item.periodo_letivo || 'N/A'}</td>
              <td>{item.ano || 'N/A'}</td>
              <td>{item.data_inicio ? new Date(item.data_inicio).toLocaleDateString() : 'N/A'}</td>
              <td>{item.data_fim ? new Date(item.data_fim).toLocaleDateString() : 'N/A'}</td>
              <td style={{ position: 'relative' }}>
                <TfiMore onClick={() => handleMoreClick(index)} style={{ cursor: 'pointer' }} />
                <OptionsMenu visible={menuVisible === index}>
                  <Option onClick={() => handleOptionClick('Excluir')}>Excluir
                    <FaTrash className='ms-2' />
                  </Option>
                  <Option onClick={() => handleOptionClick('Visualizar')}>Visualizar
                    <IoEyeOutline className='ms-2' />
                  </Option>
                  <Option onClick={() => handleOptionClick('Enviar')}>Enviar
                    <BsUpload className='ms-2' />
                  </Option>
                </OptionsMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default Table_Avaliacao;
