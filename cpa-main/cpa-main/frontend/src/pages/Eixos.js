import React, { useState, useRef } from 'react';
import Button from '../components/Buttons/Button';
import logo from '../assets/imgs/cpa_logo.svg';
import NavigationBar from '../components/utils/NavBar';
import TableEixos from '../components/Tables/TableEixos';
import './Eixos.css';
import { useEffect } from 'react';
import { Table, Row, Col } from 'react-bootstrap';
import { TfiMore } from 'react-icons/tfi';
import '../components/Tables/Table.css';
import ButtonGroup from '../components/Buttons/Button_Group';
import SearchBar from '../components/utils/SearchBar';
import Modal_Eixos from '../components/Modals/Modal_Eixos';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Eixos = () => {
  const [modalShow, setModalShow] = useState(false);
  const [updateTable, setUpdateTable] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
      <Toast ref={toast} />
      <div className="container">
        <div className="title">
          <h1>Eixos e dimensões</h1>
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
                  + Novo Eixo
                </Button>
                <Modal_Eixos
                  show={modalShow}
                  onHide={() => setModalShow(false)}
                  onSuccess={handleSuccess}
                />
              </Col>
            </Row>
            <TableEixos updateTable={updateTable} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eixos;
