// DEPOIS — estado de filtro conecta ButtonGroup com Table_Avaliacao
import React, { useState } from 'react';
import Button from '../components/Buttons/Button';
import NavigationBar from '../components/utils/NavBar';
import Table_Avaliacao from '../components/Tables/Table_Avaliacao';
import './Eixos.css';
import { Row, Col } from 'react-bootstrap';
import '../components/Tables/Table.css';
import ButtonGroup from '../components/Buttons/Button_Group';
import SearchBar from '../components/utils/SearchBar';
import Modal_Avaliacoes from '../components/Modals/Modal_Avaliacoes';

const Avaliacoes = () => {
    const [modalShow, setModalShow] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState(null); // ADICIONADO: estado do filtro

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
                                <SearchBar />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} className='text-center'>
                                <div className='Button_Group'>
                                    {/* ADICIONADO: passa callback para receber o filtro selecionado */}
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
                                <Modal_Avaliacoes
                                    show={modalShow}
                                    onHide={() => setModalShow(false)}
                                    onClose={() => setModalShow(false)}
                                />
                            </Col>
                        </Row>

                        {/* ADICIONADO: passa filtroStatus para a tabela */}
                        <Table_Avaliacao filtroStatus={filtroStatus} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Avaliacoes;