// src/pages/Modalidades.js
import React, { useState, useRef } from 'react';
import Button from '../components/Buttons/Button';
import NavigationBar from '../components/utils/NavBar';
import TableModalidades from '../components/Tables/Table_Modalidades';
import './Eixos.css';
import { Row, Col } from 'react-bootstrap';
import '../components/Tables/Table.css';
import SearchBar from '../components/utils/SearchBar';
import ModalModalidades from '../components/Modals/Modal_Modalidades';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Modalidades = () => {
    const [modalShow, setModalShow] = useState(false);
    const [updateTable, setUpdateTable] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useRef(null);

    const handleSuccess = (message) => {
        // Alterna o estado para forçar re-render na tabela
        setUpdateTable(prev => !prev);
        if (toast.current) {
            toast.current.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: message || 'Operação realizada com sucesso!',
                life: 3000
            });
        }
    };

    return (
        <div>
            <NavigationBar />
            <Toast ref={toast} />
            <div className="container">
                <div className="title">
                    <h1>Modalidades</h1>
                </div>
                <div className="eixos_table">
                    <div>
                        <Row>
                            <Col xs={12}>
                                <div>
                                    <SearchBar
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                        placeholder="    Pesquisar modalidades..."
                                    />
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12} className='text-end'>
                                <Button variant="primary" onClick={() => setModalShow(true)}>
                                    + Nova Modalidade
                                </Button>

                                <ModalModalidades
                                    show={modalShow}
                                    onHide={() => setModalShow(false)}
                                    onSuccess={handleSuccess}
                                />
                            </Col>
                        </Row>

                        {/* Passa searchQuery e updateTable para a tabela */}
                        <TableModalidades
                            searchQuery={searchQuery}
                            updateTable={updateTable}
                            onSuccess={handleSuccess}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modalidades;