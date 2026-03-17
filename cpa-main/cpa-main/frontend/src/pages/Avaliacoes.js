import React from 'react'
import Button from '../components/Buttons/Button'
import logo from '../assets/imgs/cpa_logo.svg';
import NavigationBar from '../components/utils/NavBar';
import Table_Avaliacao from '../components/Tables/Table_Avaliacao';
import './Eixos.css'
import { useEffect, useState } from 'react';
import { Table, Row, Col } from 'react-bootstrap';
import { TfiMore } from 'react-icons/tfi';
import '../components/Tables/Table.css';
import ButtonGroup from '../components/Buttons/Button_Group';
import SearchBar from '../components/utils/SearchBar';
import Modal_Avaliacoes from '../components/Modals/Modal_Avaliacoes';


const Avaliacoes = () => {
    const [modalShow, setModalShow] = useState(false);

    return (
        <div>
            <NavigationBar></NavigationBar>

            <div className="container">


                <div className="title">
                    <h1>Avaliações</h1>
                </div>
                <div className="eixos_table">
                    <div>
                        <Row>
                            <Col xs={12} >
                                <div >
                                    <SearchBar />
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12} className='text-center'>
                                <div className='Button_Group'>
                                    <ButtonGroup />
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12} className='text-end'>
                                <div className='TableEixos_Button'><Button onClick={() => setModalShow(true)}>+ Nova avaliação</Button></div>
                                <Modal_Avaliacoes
                                    className="modal"
                                    show={modalShow}
                                    onHide={() => setModalShow(false)}
                                />

                            </Col>
                        </Row>
                        <Table_Avaliacao></Table_Avaliacao>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Avaliacoes;