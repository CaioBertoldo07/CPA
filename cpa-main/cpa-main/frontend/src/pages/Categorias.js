import NavigationBar from "../components/utils/NavBar";
import { Col, Row } from "react-bootstrap";
import SearchBar from "../components/utils/SearchBar";
import Button from "../components/Buttons/Button";
import React, { useRef, useState } from "react";
import Table_Categorias from "../components/Tables/Table_Categorias";
import Modal_Categorias from "../components/Modals/Modal_Categorias";

const Categorias = () => {
    const [modalShow, setModalShow] = useState(false);
    const [updateTable, setUpdateTable] = useState(false);
    const toast = useRef(null);

    const handleSuccess = (message) => {
        setUpdateTable(prev => !prev);
        if (toast.current) {
            toast.current.show({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
        }
    };

    return (
        <div>
            <NavigationBar />
            <div className="container">
                <div className="title">
                    <h1>Categorias</h1>
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
                                    + Nova Categoria
                                </Button>
                                <Modal_Categorias
                                    show={modalShow}
                                    onHide={() => setModalShow(false)}
                                    onSuccess={handleSuccess} />
                            </Col>
                        </Row>
                        <Table_Categorias updateTable={updateTable} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Categorias;