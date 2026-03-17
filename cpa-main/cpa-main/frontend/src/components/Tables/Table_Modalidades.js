import React, { useState, useEffect } from 'react';
import { Table, Dropdown } from 'react-bootstrap';
import { TfiMore } from 'react-icons/tfi';
import './Table.css';
import EditModal from '../Modals/ModalUpdateModalidades';
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa"; 

import {
  postModalidades,
  getModalidades,
  updateModalidades,
  getModalidadesByNumero,
  deleteModalidades
} from '../../services/modalidadesService';



const Table_Modalidades = () => {
  const [modalidades, setModalidades] = useState([]); // Inicializado como array vazio
  const [loading, setLoading] = useState(true);
  const [editingModalidade, setEditingModalidade] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchModalidades = async () => {
      try {
        // Chama a função getModalidades e obtém os dados
        const response = await getModalidades();

        // Garante que response seja atribuído corretamente
        setModalidades(response || []); // Se response for undefined, define como array vazio
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar modalidades:", error);
        setModalidades([]); // Em caso de erro, garante que modalidades seja um array
        setLoading(false);
      }
    };

    fetchModalidades();
  }, []);


  const handleEdit = async (modalidade) => {
    console.log("Modalidade selecionada para edição:", modalidade);
    setEditingModalidade(modalidade); // Armazena a modalidade selecionada
    setShowEditModal(true); // Abre o modal de edição

  };
  const handleDelete = async (id) => {
    try {
      const confirmed = window.confirm("Você tem certeza que deseja deletar esta modalidade?");
      if (!confirmed) return;
      console.log("Modalidade selecionada(id):",id);
      const result = await deleteModalidades(id);
      console.log('Modalidade deletada com sucesso:', result);

      // Atualiza a lista de modalidades removendo a modalidade deletada
      setModalidades(prev => prev.filter(modalidade => modalidade.id !== id));
    } catch (error) {
      console.error('Erro ao deletar modalidade:', error);
      alert('Erro ao deletar a modalidade. Por favor, tente novamente.');
    }
  }

  return (
    <div>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <Table striped>
          <thead>
          <tr className="tr">
            {/* <th>Id</th>  */}
            <th>Modalidade de ensino</th>
            {/* <th>Modalidade de oferta</th> */}
            <th>Num. questões</th>
            <th>Data de criação</th>
            <th>Opções</th>
          </tr>
          </thead>
          <tbody>
            {Array.isArray(modalidades) && modalidades.map((modalidade, index) => (
                <tr key={index}>
                  {/* <td className="td">{modalidade.id}</td>   */}
                  <td className="td">{modalidade.mod_ensino}</td>
                  {/* <td className="td">{modalidade.mod_oferta}</td> */}
                  <td className="td">{modalidade.num_questoes}</td>
                  <td className="td">{new Date(modalidade.data_criacao).toLocaleDateString()}</td>
                  <td>
                    <Dropdown style={{ cursor: 'pointer'}}>
                      {/* <Dropdown.Toggle as={TfiMore} id="dropdown-custom-components" style={{cursor: 'pointer'}}/>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleEdit(modalidade)}>Editar modalidade</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleDelete(modalidade.id)}>Deletar modalidade</Dropdown.Item>
                      </Dropdown.Menu> */}
                         <FaRegEdit style={{ width:'24px',height:'24px'}}  onClick={() => handleEdit(modalidade)}></FaRegEdit>
                         <IoTrashOutline style={{ width:'24px',height:'24px'}} onClick={() => handleDelete(modalidade.id)} />
                    </Dropdown>
                  </td>
                </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal de Edição */}
      {editingModalidade && (
        <EditModal
          show={showEditModal}
          modalidade={editingModalidade}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedModalidade) => {
            setModalidades(prev =>
              prev.map(m => m.id === updatedModalidade.id ? updatedModalidade : m)
            );
          }}
        />
      )}
    </div>
  );
};

export default Table_Modalidades;
