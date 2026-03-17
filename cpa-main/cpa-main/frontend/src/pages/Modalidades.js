import React from 'react'
import Button from '../components/Buttons/Button'
import logo from '../assets/imgs/cpa_logo.svg';
import NavigationBar from '../components/utils/NavBar';
import Table_Modalidades from '../components/Tables/Table_Modalidades';
import './Eixos.css'
import { useEffect, useState } from 'react';
import { Table, Row, Col } from 'react-bootstrap';
import { TfiMore } from 'react-icons/tfi';
import '../components/Tables/Table.css';
import ButtonGroup from '../components/Buttons/Button_Group';
import SearchBar from '../components/utils/SearchBar';


import Modal_Modalidades from '../components/Modals/Modal_Modalidades';


const Modalidades = () => {
    const [modalShow, setModalShow] = React.useState(false);
    return (
        <div><NavigationBar></NavigationBar>
            <div className="container">

                <div className="title">
                    <h1>Modalidades</h1>
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

                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12} className='text-end'>
                                {/* <div className='TableEixos_Button'><Button>+ Novo eixo</Button></div> */}
                                {/* <div>
                    <Popup trigger=
                        {<Button>+ Novo Eixo</Button>}
                        position="right center">
                        <div>GeeksforGeeks</div>
                        <Button>Click here</Button>
                    </Popup>
            </div> */}

                                <Button variant="primary" onClick={() => setModalShow(true)}>
                                    + Nova Modalidade
                                </Button>

                                <Modal_Modalidades
                                    show={modalShow}
                                    onHide={() => setModalShow(false)}
                                />

                            </Col>
                        </Row>
                        <Table_Modalidades></Table_Modalidades>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Modalidades;