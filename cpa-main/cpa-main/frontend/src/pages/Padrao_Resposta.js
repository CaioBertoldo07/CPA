// src/pages/Padrao_Resposta.js
import React, { useState, useRef } from 'react';
import { Row, Col } from 'react-bootstrap';
import Button from '../components/Buttons/Button';
import NavigationBar from '../components/utils/NavBar';
import SearchBar from '../components/utils/SearchBar';
import ModalAddPadraoResposta from '../components/Modals/ModalAddPadraoResposta';
import TablePadrao from '../components/Tables/TablePadraoResposta';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './Eixos.css';

const Padrao_resposta = () => {
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
                    <h1>Padrões de Resposta</h1>
                </div>
                <div className="eixos_table">
                    <Row>
                        <Col xs={12}>
                            <SearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="    Pesquisar padrões de resposta..."
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} className="text-end">
                            <Button variant="primary" onClick={() => setModalShow(true)}>
                                + Novo Padrão
                            </Button>
                            <ModalAddPadraoResposta
                                show={modalShow}
                                onHide={() => setModalShow(false)}
                                onSuccess={handleSuccess}
                            />
                        </Col>
                    </Row>
                    <TablePadrao
                        updateTable={updateTable}
                        searchQuery={searchQuery}
                        onSuccess={handleSuccess}
                    />
                </div>
            </div>
        </div>
    );
};

export default Padrao_resposta;