import React, { useState, useEffect, useRef } from 'react';
import { Table, Dropdown, Button, Accordion } from 'react-bootstrap';
import { IoSettingsSharp } from "react-icons/io5";
import { TfiMore } from 'react-icons/tfi';
import { getPadraoResposta, getPadraoRespostaById, deletarPadraoResposta } from '../../services/padraoRespostaService';
import { getAlternativasByPadraoRespostaId, getAlternativas, cadastrarAlternativa, editarAlternativa, deletarAlternativa, getAlternativaById } from '../../services/alternativasServices';
import ModalUpdatePadraoResposta from '../Modals/ModalUpdatePadraoResposta';
import ModalAddPadraoResposta from '../Modals/ModalAddPadraoResposta';
import ModalAddAlternativa from '../Modals/ModalAddAlternativa';
import ModalUpdateAlternativa from '../Modals/ModalUpdateAlternativa';
import { Toast } from 'primereact/toast';
import './Table.css';
import ButtonAdicionar from '../Buttons/Button_Adicionar';
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa"; 


const TablePadraoResposta = ({ updateTable }) => {

  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModalUpdatePadraoResposta, setShowModalUpdatePadraoResposta] = useState(false);
  const [showModalAddPadraoResposta, setShowModalAddPadraoResposta] = useState(false);
  const [showModalAddAlternativa, setShowModalAddAlternativa] = useState(false);
  const [showModalUpdateAlternativa, setShowModalUpdateAlternativa] = useState(false);
  const [alternativas, setAlternativas] = useState([{ descricao: '' }]);
  const [currentPadraoNumero, setCurrentPadraoNumero] = useState(null);
  const toast = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPadraoResposta();
        setData(data);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    fetchData();
  }, [updateTable]);

  const handleEdit = async (item) => {
    try {
      console.log("Modalidade selecionada para edição:", item);
      setSelectedItem(item); // Armazena a modalidade selecionada
      setShowModalUpdateAlternativa(true);

    } catch (error) {
      console.error('Error fetching alternativa data', error);
    }
  };
  const handleEditPadrao = async (item) => {
    try {
      console.log("Padrão de resposta selecionado para edição:", item);
      setSelectedItem(item); // Armazena o padrão de resposta selecionado
      setShowModalUpdatePadraoResposta(true);
    } catch (error) {
      console.error('Error fetching padraoResposta data', error);
    }
  };
  const handleDeletePadrao = async (item) => {
    try {
      // Passo 1: Buscar todas as alternativas associadas ao padrão de resposta
      const alternativas = await getAlternativasByPadraoRespostaId(item.id);

      // Passo 2: Apagar todas as alternativas
      if (Array.isArray(alternativas) && alternativas.length > 0) {
        for (const alternativa of alternativas) {
          await deletarAlternativa(alternativa.id);
        }
      }

      // Passo 3: Apagar o padrão de resposta
      await deletarPadraoResposta(item.id);

      // Atualizar o estado, removendo o padrão de resposta deletado
      setData((prevData) => {
        // Certifique-se de que prevData seja um array antes de aplicar o filtro
        if (Array.isArray(prevData)) {
          return prevData.filter((d) => d.id !== item.id);
        }
        return prevData; // Retorna o estado anterior caso não seja um array
      });

      console.log('Padrão de resposta e alternativas deletados com sucesso');
    } catch (error) {
      console.error('Error deleting padraoResposta or alternativas', error);
    }
  };


  const handleDelete = async (item) => {
    try {
      await deletarAlternativa(item.id);
      setData((prevData) => prevData.filter((d) => d.id !== item.id));
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Alternativa deletada com sucesso', life: 3000 });
    } catch (error) {
      console.error('Error deleting padraoResposta', error);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar alternativa', life: 3000 });
    }
  };

  const handleCloseModalUpdate = () => {
    setShowModalUpdatePadraoResposta(false);
    setSelectedItem(null);
  };
  const handleCloseModalUpdateAlternativa = () => {
    setShowModalUpdateAlternativa(false);
    setSelectedItem(null);
  };

  const handleCloseModalAdd = () => {
    setShowModalAddAlternativa(false);
  };


  const handleUpdateSuccess = (message) => {
    toast.current.show({ severity: 'success', summary: 'Sucesso', detail: message, life: 3000 });
    setShowModalUpdatePadraoResposta(false);

    if (typeof updateTable === 'function') {
      updateTable();
    }
  };

  const handleToggle = async (id) => {
    if (!alternativas[id]) {
      try {
        const data = await getAlternativasByPadraoRespostaId(id);
        setAlternativas((prev) => ({ ...prev, [id]: data }));
        console.log(data);
      }
      catch (error) {
        console.error('Error fetching alternativas', error);
      }
    }
  };

  const handleOpenAddDimensaoModal = (id) => {
    setCurrentPadraoNumero(id);
    setShowModalAddAlternativa(true);
  };

  return (
    <div className="eixos-accordion">
      <Toast ref={toast} />
      <Accordion>
        {data.map((padraoResposta) => (
          <Accordion.Item eventKey={padraoResposta.id.toString()} key={padraoResposta.id}>
            <Accordion.Header onClick={() => handleToggle(padraoResposta.id)}>
              {padraoResposta.id} - {padraoResposta.sigla}
            </Accordion.Header>
            <Accordion.Body>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                {/* Nova alternativaaaa */}
                <ButtonAdicionar
                  className="add-dimensao-button"
                  onClick={() => handleOpenAddDimensaoModal(padraoResposta.id)}
                  variant="primary"
                  style={{ marginRight: '10px' }}
                >
                +
                </ButtonAdicionar>
                <Dropdown>
                  <Dropdown.Toggle as={IoSettingsSharp} id="dropdown-custom-components" style={{ cursor: 'pointer', width: '30px', height: '30px' }} />
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleEditPadrao(padraoResposta)}>Editar padrão</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDeletePadrao(padraoResposta)}>Deletar padrão</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              {alternativas[padraoResposta.id] ? (
                <Table striped >
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Alternativa</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(alternativas[padraoResposta.id]) &&
                      alternativas[padraoResposta.id].map((alternativa) => (
                        <tr key={alternativa.id}>
                          <td>{alternativa.id}</td>
                          <td>{alternativa.descricao}</td>
                          <td>
                            <Dropdown style={{ cursor: 'pointer'}}>
                              {/* <Dropdown.Toggle as={TfiMore} id="dropdown-custom-components" style={{ cursor: 'pointer' }} />
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleEdit(alternativa, true)}>Editar alternativa</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleDelete(alternativa, true)}>Deletar alternativa</Dropdown.Item>
                              </Dropdown.Menu> */}
                                 <FaRegEdit style={{ width:'24px',height:'24px'}}  onClick={() => handleEdit(alternativa, true)}>   </FaRegEdit>
                                 <IoTrashOutline style={{ width:'24px',height:'24px'}} onClick={() => handleDelete(alternativa, true)} />
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              ) : (
                <p>Nenhuma alternativa carregada</p>
              )}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      {/* Modal Update */}
      {showModalUpdatePadraoResposta && selectedItem && (
        <ModalUpdatePadraoResposta
          show={showModalUpdatePadraoResposta}
          handleClose={handleCloseModalUpdate}
          padraoData={selectedItem}
          onSuccess={handleUpdateSuccess}
        />
      )}


      {showModalAddPadraoResposta && currentPadraoNumero !== null && (
        <ModalAddPadraoResposta
          show={showModalAddPadraoResposta}
          handleClose={handleCloseModalAdd}
          paraoNumero={currentPadraoNumero}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {showModalAddAlternativa && currentPadraoNumero !== null && (
        <ModalAddAlternativa
          show={showModalAddAlternativa}
          handleClose={handleCloseModalAdd}
          paraoNumero={currentPadraoNumero}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Modal Update*/}
      {showModalUpdateAlternativa && selectedItem && (
        <ModalUpdateAlternativa
          show={showModalUpdateAlternativa}
          handleClose={handleCloseModalUpdateAlternativa}
          paraoNumero={currentPadraoNumero}
          onSuccess={handleUpdateSuccess}
          alternativa={selectedItem} // Passar a alternativa selecionada
        />
      )}
    </div>
  );
};

export default TablePadraoResposta;