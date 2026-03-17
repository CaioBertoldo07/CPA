import React, { useEffect, useState, useRef } from 'react';
import { Table, Dropdown } from 'react-bootstrap';
import { TfiMore } from 'react-icons/tfi';
import { Toast } from 'primereact/toast';
import Modal_Admin from '../Modals/Modal_Admin';  // Modal para editar/criar admins
import { getAdmins, deleteAdmin } from '../../services/adminService';  // Serviços de admin

const TableAdmins = ({ updateTable }) => {
    const [admins, setAdmins] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const toast = useRef(null);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const data = await getAdmins();  // Chama o serviço para buscar admins
                setAdmins(data || []);
            } catch (error) {
                console.error("Erro ao buscar admins", error);
            }
        };
        fetchAdmins();
    }, [updateTable]);

    const handleDeleteAdmin = async (admin) => {
        try {
            await deleteAdmin(admin.id);  // Deleta o admin
            setAdmins(prevAdmins => prevAdmins.filter(a => a.id !== admin.id));  // Remove da tabela
            toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Admin deletado com sucesso', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar admin', life: 3000 });
        }
    };

    const handleUpdateAdmin = (admin) => {
        setSelectedAdmin(admin);
        setModalShow(true);  // Abre o modal com o admin selecionado
    };

    const handleAdminUpdated = (id, updatedAdmin) => {
        setAdmins(prevAdmins => prevAdmins.map(admin =>
            admin.id === id ? { ...admin, ...updatedAdmin } : admin
        ));
        setModalShow(false);  // Fecha o modal após atualizar
    };

    return (
        <div>
            <Toast ref={toast} />
            <Table striped>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Opções</th>
                </tr>
                </thead>
                <tbody>
                {Array.isArray(admins) && admins.length > 0 ? (
                    admins.map(admin => (
                        <tr key={admin.id}>
                            <td>{admin.id}</td>
                            <td>{admin.email}</td>
                            <td>
                                <Dropdown>
                                    <Dropdown.Toggle as={TfiMore} id="dropdown-custom-components" style={{ cursor: 'pointer' }} />
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => handleUpdateAdmin(admin)}>Editar Admin</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleDeleteAdmin(admin)}>Deletar Admin</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3">Nenhum admin cadastrado</td>
                    </tr>
                )}
                </tbody>
            </Table>

            <Modal_Admin
                show={modalShow}
                onHide={() => setModalShow(false)}
                admin={selectedAdmin}
                onUpdateAdmin={handleAdminUpdated}
                onSuccess={updateTable}  // Atualiza a tabela após sucesso
            />
        </div>
    );
};

export default TableAdmins;
