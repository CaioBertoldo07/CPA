import React, { useEffect, useRef, useState } from "react";
import { getCategorias } from "../../services/categoriasService";
import { Dropdown, Table } from "react-bootstrap";
import { TfiMore } from "react-icons/tfi";
import { deleteCategoria } from "../../services/categoriasService";
import { Toast } from 'primereact/toast';
import Modal_Categorias from "../Modals/Modal_Categorias";
import { IoTrashOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa"; 


const Table_Categorias = ({ updateTable }) => {
    const [datacategorias, setDataCategorias] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const toast = useRef('');

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await getCategorias();
                setDataCategorias(data || []);
            } catch (error) { }
        };
        fetchCategorias();
    }, [updateTable]);

    const handleDeleteCategoria = async (item) => {
        try {
            await deleteCategoria(item.id);
            if (Array.isArray(datacategorias)) {
                setDataCategorias(prevData => prevData.filter(d => d.id !== item.id));
            }
            toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Categoria deletada com sucesso', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar item', life: 3000 });
        }
    };

    const handleUpdateCategoria = (categoria) => {
        setSelectedCategoria(categoria);
        setModalShow(true);
    };

    const handleCategoriaUpdated = (id, updatedCategoria) => {
        setDataCategorias(prevData => prevData.map(categoria =>
            categoria.id === id ? { ...categoria, ...updatedCategoria } : categoria
        ));
        setModalShow(false);
    };

    return (
        <div>
            <Toast ref={toast} />
            <Table striped>
                <thead>
                    <tr className="tr">
                        <th>#</th>
                        <th>Nome</th>
                        <th>Data de Criação</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(datacategorias) && datacategorias.length > 0 ? (
                        datacategorias.map((categoria) => (
                            <tr key={categoria.id}>
                                <td>{categoria.id}</td>
                                <td>{categoria.nome}</td>
                                <td>{new Date(categoria.data_criacao).toLocaleDateString()}</td>
                                <td>
                                    <Dropdown style={{ cursor: 'pointer'}}>
                                        {/* <Dropdown.Toggle as={TfiMore} id="dropdown-custom-components" style={{ cursor: 'pointer' }} />
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => handleUpdateCategoria(categoria)}>Editar Categoria</Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleDeleteCategoria(categoria)}>Deletar Categoria</Dropdown.Item>
                                        </Dropdown.Menu> */}
                                           <FaRegEdit style={{ width:'24px',height:'24px'}}  onClick={() => handleUpdateCategoria(categoria)}>   </FaRegEdit>
                                           <IoTrashOutline style={{ width:'24px',height:'24px'}} onClick={() => handleDeleteCategoria(categoria)} />
                                    </Dropdown>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">Nenhuma categoria cadastrada</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            <Modal_Categorias
                show={modalShow}
                onHide={() => setModalShow(false)}
                categoria={selectedCategoria}
                onUpdateCategoria={handleCategoriaUpdated}
                onSuccess={updateTable}
            />
        </div>
    );
};

export default Table_Categorias;