// src/pages/Avaliacoes.js
import React, { useState } from 'react';
import Button from '../components/Buttons/Button';
import NavigationBar from '../components/utils/NavBar';
import TableAvaliacao from '../components/Tables/Table_Avaliacao';
import './Eixos.css';
import { Row, Col } from 'react-bootstrap';
import '../components/Tables/Table.css';
import ButtonGroup from '../components/Buttons/Button_Group';
import SearchBar from '../components/utils/SearchBar';
import ModalAvaliacoes from '../components/Modals/Modal_Avaliacoes';

const Avaliacoes = () => {
    const [modalShow, setModalShow] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    // ← NOVO: toggle que força refetch na Table_Avaliacao
    const [refreshTable, setRefreshTable] = useState(false);

    const handleAvaliacaoCriada = () => {
        setModalShow(false);
        // Alterna o flag → Table_Avaliacao re-busca a lista
        setRefreshTable(prev => !prev);
    };

    return (
        <div>
            <NavigationBar />
            <div className="container">
                <div className="title">
                    <h1>Avaliações</h1>
                </div>
                <div className="eixos_table">
                    <div>
                        <Row>
                            <Col xs={12}>
                                {/* SearchBar agora controlado */}
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="    Pesquisar avaliações..."
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} className='text-center'>
                                <div className='Button_Group'>
                                    <ButtonGroup onFiltroChange={setFiltroStatus} />
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} className='text-end'>
                                <div className='TableEixos_Button'>
                                    <Button onClick={() => setModalShow(true)}>
                                        + Nova avaliação
                                    </Button>
                                </div>
                                <ModalAvaliacoes
                                    show={modalShow}
                                    onHide={() => setModalShow(false)}
                                    // ← chama callback que fecha modal E dispara refetch
                                    onClose={handleAvaliacaoCriada}
                                />
                            </Col>
                        </Row>

                        <TableAvaliacao
                            filtroStatus={filtroStatus}
                            searchQuery={searchQuery}
                            // ← passa o flag de refresh
                            refreshTable={refreshTable}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Avaliacoes;