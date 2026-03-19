// src/pages/Questoes.js
import React, { useRef, useState } from 'react';
import '../components/Tables/Table.css';
import Button from '../components/Buttons/Button';
import NavigationBar from '../components/utils/NavBar';
import TableQuestoes from '../components/Tables/Table_Questoes';
import SearchBar from '../components/utils/SearchBar';
import ModalQuestoes from '../components/Modals/Modal_Questoes';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Questoes = () => {
    const [modalShow, setModalShow] = useState(false);
    const [updateTable, setUpdateTable] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useRef(null);

    const handleSuccess = (message) => {
        setModalShow(false);
        // ← Alterna o toggle → Table_Questoes re-busca
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
                    <h1>Questões</h1>
                </div>
                <div className="table-skeleton">
                    <div>
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="    Pesquisar questões..."
                        />
                    </div>
                    <div className='add-row'>
                        <Button variant="primary" onClick={() => setModalShow(true)}>
                            + Nova questão
                        </Button>
                    </div>

                    {/* Modal de CRIAR — fica no pai, recebe handleSuccess */}
                    <ModalQuestoes
                        show={modalShow}
                        onHide={() => setModalShow(false)}
                        questao={null}
                        onSuccess={handleSuccess}
                        onUpdateQuestion={handleSuccess}
                    />

                    <TableQuestoes
                        searchQuery={searchQuery}
                        updateTable={updateTable}
                        onSuccess={handleSuccess}
                    />
                </div>
            </div>
        </div>
    );
};

export default Questoes;