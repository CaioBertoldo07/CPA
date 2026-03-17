import React, {useRef, useState} from 'react'
import '../components/Tables/Table.css';
import Button from '../components/Buttons/Button'
import NavigationBar from '../components/utils/NavBar';
import Table_Questoes from '../components/Tables/Table_Questoes';
import SearchBar from '../components/utils/SearchBar';
import Modal_Questoes from '../components/Modals/Modal_Questoes';
import {FaPlus} from "react-icons/fa6";
import ButtonAdicionar from "../components/Buttons/Button_Adicionar";
const Questoes = () => {
    const [modalShow, setModalShow] = useState(false);
    const [updateTable, setUpdateTable] = useState(false);
    const toast = useRef(null);

    const handleSuccess = (message) => {
        setUpdateTable(prev => !prev);
        if (toast.current) {
            toast.current.show({severity: 'success', summary: 'Success', detail: message, life: 3000});
        }
    };


    return (
        <div>
            <NavigationBar></NavigationBar>
            <div className="container">
                <div className="title">
                    <h1>Questões</h1>
                </div>
                <div className="table-skeleton">
                    <div>
                        <SearchBar/>
                    </div>
                    <div className='add-row'>
                        <Button variant="primary" onClick={() => setModalShow(true)}>
                            + Nova questão
                        </Button>
                        
                        <Modal_Questoes
                            show={modalShow}
                            onHide={() => setModalShow(false)}
                            onSuccess={handleSuccess}/>
                    </div>
                    <Table_Questoes updateTable={updateTable}></Table_Questoes>
                </div>
            </div>
        </div>
    )
}

export default Questoes;