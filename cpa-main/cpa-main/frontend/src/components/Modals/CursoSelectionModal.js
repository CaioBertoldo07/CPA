import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button, Form, Table } from 'react-bootstrap';
import { getCursosByUnidades } from '../../services/cursosService';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';

function CursoSelectionModal({ show, onHide, onCursosSelected, unidadesSelecionadas }) {
    const [cursos, setCursos] = useState([]);
    const [selectedCursos, setSelectedCursos] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        const fetchCursos = async () => {
            if (unidadesSelecionadas && unidadesSelecionadas.length > 0) {
                try {
                    const unidadesIds = unidadesSelecionadas.map(unidade => unidade.value);
                    const fetchedCursos = await getCursosByUnidades(unidadesIds);
                    // Define a propriedade "value" como o identificador_api_lyceum
                    const cursosWithValue = fetchedCursos.map(curso => ({
                        ...curso,
                        value: curso.identificador_api_lyceum,
                    }));
                    setCursos(cursosWithValue);
                } catch (error) {
                    console.error("Erro ao buscar cursos:", error);
                }
            } else {
                setCursos([]);
            }
        };

        fetchCursos();
    }, [unidadesSelecionadas]);

    const handleSelectCurso = (curso) => {
        // Usa o identificador_api_lyceum para comparação
        if (selectedCursos.some(c => c.identificador_api_lyceum === curso.identificador_api_lyceum)) {
            setSelectedCursos(selectedCursos.filter(c => c.identificador_api_lyceum !== curso.identificador_api_lyceum));
        } else {
            setSelectedCursos([...selectedCursos, curso]);
        }
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedCursos([]);
        } else {
            setSelectedCursos(cursos);
        }
        setSelectAll(!selectAll);
    };

    const handleConfirmSelection = () => {
        onCursosSelected(selectedCursos);
        setSelectedCursos([]);
        setSelectAll(false);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Selecionar Cursos</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {cursos && cursos.length > 0 ? (
                    <>
                        <Form.Check
                            type="checkbox"
                            label="Selecionar Todos"
                            checked={selectAll}
                            onChange={handleSelectAll}
                        />
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Código</th>
                                    <th>Curso</th>
                                    <th>Modalidade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursos
                                    .filter(curso => curso.modalidade != null)
                                    .map(curso => (
                                        <tr
                                            key={curso.id}
                                            onClick={() => handleSelectCurso(curso)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={selectedCursos.some(c => c.identificador_api_lyceum === curso.identificador_api_lyceum)}
                                                    readOnly
                                                />
                                            </td>
                                            <td>{curso.identificador_api_lyceum}</td>
                                            <td>{curso.nome}</td>
                                            <td>{curso.modalidade}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </>
                ) : (
                    <p>Nenhum curso disponível para as unidades selecionadas.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <ButtonCancelar variant="secondary" onClick={onHide}>Cancelar</ButtonCancelar>
                <ButtonCadastrar variant="primary" onClick={handleConfirmSelection}>Confirmar Seleção</ButtonCadastrar>
            </Modal.Footer>
        </Modal>
    );
}

export default CursoSelectionModal;
