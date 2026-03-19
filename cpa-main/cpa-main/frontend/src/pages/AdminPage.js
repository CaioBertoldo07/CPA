// src/pages/AdminPage.js
import React, { useRef, useState } from 'react';
import NavigationBar from "../components/utils/NavBar";
import TableUsers from "../components/Tables/TableAdmins";
import { Col, Row } from "react-bootstrap";
import SearchBar from "../components/utils/SearchBar";
import Button from "../components/Buttons/Button";
import ModalAdmin from "../components/Modals/Modal_Admin";
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const AdminPage = () => {
    const [modalShow, setModalShow] = useState(false);
    const [updateTable, setUpdateTable] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useRef(null);

    const handleSuccess = (message) => {
        setUpdateTable(prev => !prev);
        if (toast.current) {
            toast.current.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: message || 'Operação realizada com sucesso!',
                life: 3000,
            });
        }
    };

    return (
        <div>
            <NavigationBar />
            <Toast ref={toast} />
            <div className="container">
                <div className="title">
                    <h1>Administradores</h1>
                </div>
                <div className="eixos_table">
                    <div>
                        <Row>
                            <Col xs={12}>
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="    Pesquisar administradores..."
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} className="text-end">
                                <Button variant="primary" onClick={() => setModalShow(true)}>
                                    + Novo Administrador
                                </Button>
                                <ModalAdmin
                                    show={modalShow}
                                    onHide={() => setModalShow(false)}
                                    onSuccess={handleSuccess}
                                />
                            </Col>
                        </Row>
                        <TableUsers
                            updateTable={updateTable}
                            searchQuery={searchQuery}
                            onSuccess={handleSuccess}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;