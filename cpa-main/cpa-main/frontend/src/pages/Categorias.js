// src/pages/Categorias.js
import NavigationBar from "../components/utils/NavBar";
import { Col, Row } from "react-bootstrap";
import SearchBar from "../components/utils/SearchBar";
import Button from "../components/Buttons/Button";
import React, { useRef, useState } from "react";
import TableCategorias from "../components/Tables/Table_Categorias";
import ModalCategorias from "../components/Modals/Modal_Categorias";
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Categorias = () => {
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
                    <h1>Categorias</h1>
                </div>
                <div className="eixos_table">
                    <div>
                        <Row>
                            <Col xs={12}>
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="    Pesquisar categorias..."
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} className="text-end">
                                <Button variant="primary" onClick={() => setModalShow(true)}>
                                    + Nova Categoria
                                </Button>
                                <ModalCategorias
                                    show={modalShow}
                                    onHide={() => setModalShow(false)}
                                    onSuccess={handleSuccess}
                                />
                            </Col>
                        </Row>
                        <TableCategorias
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

export default Categorias;