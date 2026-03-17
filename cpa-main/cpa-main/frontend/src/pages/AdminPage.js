import React, { useRef, useState } from 'react';
import NavigationBar from "../components/utils/NavBar";
import TableUsers from "../components/Tables/TableAdmins";
import { Col, Row } from "react-bootstrap";
import SearchBar from "../components/utils/SearchBar";
import Button from "../components/Buttons/Button";
import Modal_Admin from "../components/Modals/Modal_Admin";

const AdminPage = () => {
    const [modalShow, setModalShow] = useState(false);
    const [updateTable, setUpdateTable] = useState(false);
    const toast = useRef(null);

    const handleSuccess = (message) => {
        setUpdateTable(prev => !prev);  // Atualiza a tabela ao receber sucesso
        if (toast.current) {
            toast.current.show({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
        }
    };

    return (
        <div>
            <NavigationBar />
            <div className="container">
                <div className="title">
                    <h1>Administradores</h1>
                </div>
                <div className="eixos_table">
                    <div>
                        <Row>
                            <Col xs={12}>
                                <div>
                                    <SearchBar />
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} className="text-center"></Col>
                        </Row>
                        <Row>
                            <Col xs={12} className="text-end">
                                <Button variant="primary" onClick={() => setModalShow(true)}>
                                    + Novo Administrador
                                </Button>
                                <Modal_Admin
                                    show={modalShow}
                                    onHide={() => setModalShow(false)}
                                    onSuccess={handleSuccess} // Callback para tratar sucesso
                                />
                            </Col>
                        </Row>
                        <TableUsers updateTable={updateTable} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
