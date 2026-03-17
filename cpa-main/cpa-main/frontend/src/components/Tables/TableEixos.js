import React, { useEffect, useState, useRef } from 'react';
import { Table, Dropdown, Accordion } from 'react-bootstrap';
import ButtonAdicionar from '../Buttons/Button_Adicionar';
import { IoSettingsSharp } from "react-icons/io5";
import { TfiMore } from 'react-icons/tfi';
import { deletarEixo, getEixos, getEixoByNumero } from '../../services/eixosService';
import { getDimensoesByEixo, getDimensaoByNumero, deletarDimensao, cadastrarDimensao } from '../../services/dimensoesService';
import ModalUpdate from '../Modals/ModalUpdateEixo';
import ModalUpdateDimensao from '../Modals/ModalUpdateDimensao';
import ModalAddDimensao from '../Modals/ModalAddDimensao';
import { Toast } from 'primereact/toast';
import './Table.css';
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa"; 

const TableEixos = ({ updateTable }) => {
  const [data, setData] = useState([]);
  const [dimensoes, setDimensoes] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [showModalUpdateDimensao, setShowModalUpdateDimensao] = useState(false);
  const [showModalAddDimensao, setShowModalAddDimensao] = useState(false);
  const [currentEixoNumero, setCurrentEixoNumero] = useState(null);
  const [isEditingDimensao, setIsEditingDimensao] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    fetchData();
  }, [updateTable]);

  const fetchData = async () => {
    try {
      const eixos = await getEixos();
      setData(eixos);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const handleEdit = async (item, isDimensao = false) => {
    try {
      if (isDimensao) {
        setIsEditingDimensao(true);
        const dimensaoData = await getDimensaoByNumero(item.numero);
        setSelectedItem(dimensaoData);
        setShowModalUpdateDimensao(true);
      } else {
        setIsEditingDimensao(false);
        const eixoData = await getEixoByNumero(item.numero);
        setSelectedItem(eixoData);
        setShowModalUpdate(true);
      }
    } catch (error) {
      console.error(`Error fetching ${isDimensao ? 'dimensão' : 'eixo'} data`, error);
    }
  };

  const handleDelete = async (item, isDimensao = false) => {
    try {
      if (isDimensao) {
        await deletarDimensao(item.numero);
        setDimensoes(prev => {
          const updated = { ...prev };
          if (Array.isArray(updated[item.numero_eixos])) {
            updated[item.numero_eixos] = updated[item.numero_eixos].filter(d => d.numero !== item.numero);
          }
          return updated;
        });
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Dimensão deletada com sucesso', life: 3000 });
      } else {
        await deletarEixo(item.numero);
        setData(prevData => prevData.filter(d => d.numero !== item.numero));
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Eixo deletado com sucesso', life: 3000 });
      }

      // Garantir a atualização chamando `fetchData`
      fetchData();

    } catch (error) {
      console.error('Error deleting item', error);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar item', life: 3000 });
    }
  };

  const handleCloseModalUpdate = () => {
    setShowModalUpdate(false);
    setSelectedItem(null);
    fetchData();
  };

  const handleCloseModalUpdateDimensao = () => {
    setShowModalUpdateDimensao(false);
    setSelectedItem(null);
    fetchData();
  };

  const handleCloseModalAddDimensao = () => {
    setShowModalAddDimensao(false);
    setCurrentEixoNumero(null);
    fetchData();
  };

  const handleUpdateSuccess = (message, newDimensao) => {
    toast.current.show({ severity: 'success', summary: 'Sucesso', detail: message, life: 3000 });
    setShowModalUpdate(false);
    setShowModalUpdateDimensao(false);
    setShowModalAddDimensao(false);
    
    if (newDimensao) {
      setDimensoes(prev => {
        const updated = { ...prev };
        if (!updated[newDimensao.numero_eixos]) {
          updated[newDimensao.numero_eixos] = [];
        }
        updated[newDimensao.numero_eixos].push(newDimensao);
        return updated;
      });
    }
    
    fetchData(); // Atualiza os dados após o sucesso da atualização
  };

  const handleToggle = async (eixoNumero) => {
    if (!dimensoes[eixoNumero]) {
      try {
        const data = await getDimensoesByEixo(eixoNumero);
        setDimensoes(prev => ({ ...prev, [eixoNumero]: data }));
      } catch (error) {
        console.error('Error fetching dimensões', error);
      }
    }
  };

  const handleOpenAddDimensaoModal = (eixoNumero) => {
    setCurrentEixoNumero(eixoNumero);
    setShowModalAddDimensao(true);
  };

  return (
    <div className="eixos-accordion">
      <Toast ref={toast} />
      <Accordion>
        {data.map((eixo) => (
          <Accordion.Item eventKey={eixo.numero.toString()} key={eixo.numero}>
            <Accordion.Header onClick={() => handleToggle(eixo.numero)}>
              {eixo.numero} - {eixo.nome}
            </Accordion.Header>
            <Accordion.Body>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <ButtonAdicionar className="add-dimensao-button" onClick={() => handleOpenAddDimensaoModal(eixo.numero)} variant="primary" style={{ marginRight: '10px' }}>
                  +
                </ButtonAdicionar>
                <Dropdown>
                  <Dropdown.Toggle as={IoSettingsSharp} id="dropdown-custom-components" style={{ cursor: 'pointer', width: '30px', height: '30px' }} />
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleEdit(eixo)}>Editar eixo</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDelete(eixo)}>Deletar eixo</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              {dimensoes[eixo.numero] ? (
                <Table striped>
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Nome da dimensão</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(dimensoes[eixo.numero]) && dimensoes[eixo.numero].map((dimensao) => (
                      <tr key={dimensao.numero}>
                        <td>{dimensao.numero}</td>
                        <td>{dimensao.nome}</td>
                        <td>
                          <Dropdown style={{ cursor: 'pointer'}}>
                            <FaRegEdit style={{ width:'24px',height:'24px'}} onClick={() => handleEdit(dimensao, true)} />
                            <IoTrashOutline style={{ width:'24px',height:'24px'}} onClick={() => handleDelete(dimensao, true)} />
                          </Dropdown>
                        </td>
                      </tr>
                    ))}  
                  </tbody>
                </Table>
              ) : (
                <p>Nenhuma dimensão carregada</p>
              )}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      {/* Modal para Eixo */}
      {showModalUpdate && selectedItem && !isEditingDimensao && (
        <ModalUpdate
          show={showModalUpdate}
          handleClose={handleCloseModalUpdate}
          eixoData={selectedItem}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Modal para Dimensão */}
      {showModalUpdateDimensao && selectedItem && isEditingDimensao && (
        <ModalUpdateDimensao
          show={showModalUpdateDimensao}
          handleClose={handleCloseModalUpdateDimensao}
          dimensaoData={selectedItem}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Modal para Adicionar Dimensão */}
      {showModalAddDimensao && currentEixoNumero && (
        <ModalAddDimensao
          show={showModalAddDimensao}
          handleClose={handleCloseModalAddDimensao}
          eixoNumero={currentEixoNumero}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default TableEixos;
