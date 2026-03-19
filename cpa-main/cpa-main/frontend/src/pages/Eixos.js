// src/pages/Eixos.js
import React, { useState, useRef } from 'react';
import Button from '../components/Buttons/Button';
import NavigationBar from '../components/utils/NavBar';
import TableEixos from '../components/Tables/TableEixos';
import './Eixos.css';
import { Row, Col } from 'react-bootstrap';
import '../components/Tables/Table.css';
import SearchBar from '../components/utils/SearchBar';
import ModalEixos from '../components/Modals/Modal_Eixos';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Eixos = () => {
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
                    <h1>Eixos e dimensões</h1>
                </div>
                <div className="eixos_table">
                    <div>
                        <Row>
                            <Col xs={12}>
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="    Pesquisar eixos ou dimensões..."
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} className="text-end">
                                <Button variant="primary" onClick={() => setModalShow(true)}>
                                    + Novo Eixo
                                </Button>
                                <ModalEixos
                                    show={modalShow}
                                    onHide={() => setModalShow(false)}
                                    onSuccess={handleSuccess}
                                />
                            </Col>
                        </Row>
                        <TableEixos
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

export default Eixos;