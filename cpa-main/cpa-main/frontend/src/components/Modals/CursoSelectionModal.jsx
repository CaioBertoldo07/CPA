// src/components/Modals/CursoSelectionModal.js
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Form, Table, Spinner, Alert } from 'react-bootstrap';
import { getCursosByUnidades } from '../../services/cursosService';
import ButtonCancelar from '../Buttons/Button_Cancelar';
import ButtonCadastrar from '../Buttons/Button_Cadastrar';

function CursoSelectionModal({ show, onHide, onCursosSelected, unidadesSelecionadas }) {
    const [cursos, setCursos] = useState([]);
    const [selectedCursos, setSelectedCursos] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        if (!show) return;

        const fetchCursos = async () => {
            if (!unidadesSelecionadas || unidadesSelecionadas.length === 0) {
                setError('Nenhuma unidade selecionada. Volte e selecione ao menos uma unidade.');
                setCursos([]);
                return;
            }

            setLoading(true);
            setError('');
            setDebugInfo('');

            try {
                const unidadesIds = unidadesSelecionadas.map(u => u.value);
                console.log('[CursoModal] Buscando cursos para unidades:', unidadesIds);

                const response = await getCursosByUnidades(unidadesIds);
                console.log('[CursoModal] Resposta bruta:', response);

                // Normaliza a resposta — pode vir como array direto, ou { data: [] }, ou { cursos: [] }
                let lista = [];
                if (Array.isArray(response)) {
                    lista = response;
                } else if (response && Array.isArray(response.data)) {
                    lista = response.data;
                } else if (response && Array.isArray(response.cursos)) {
                    lista = response.cursos;
                } else if (response && typeof response === 'object') {
                    // Tenta pegar o primeiro array encontrado no objeto
                    const firstArray = Object.values(response).find(v => Array.isArray(v));
                    if (firstArray) lista = firstArray;
                }

                console.log('[CursoModal] Lista normalizada:', lista);

                if (lista.length === 0) {
                    setDebugInfo(
                        `Nenhum curso retornado para as unidades: [${unidadesIds.join(', ')}]. ` +
                        `Resposta da API: ${JSON.stringify(response)}`
                    );
                }

                setCursos(lista);
            } catch (err) {
                console.error('[CursoModal] Erro ao buscar cursos:', err);
                const msg = err?.response?.data?.error
                    || err?.message
                    || 'Erro ao carregar cursos.';
                const status = err?.response?.status;
                setError(`${msg}${status ? ` (HTTP ${status})` : ''}`);
                setCursos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCursos();
    }, [show, unidadesSelecionadas]);

    // Reset ao fechar
    useEffect(() => {
        if (!show) {
            setSelectedCursos([]);
            setSelectAll(false);
            setError('');
            setDebugInfo('');
        }
    }, [show]);

    const handleSelectCurso = (curso) => {
        const key = curso.identificador_api_lyceum ?? curso.id;
        const jaSelected = selectedCursos.some(
            c => (c.identificador_api_lyceum ?? c.id) === key
        );
        if (jaSelected) {
            setSelectedCursos(prev =>
                prev.filter(c => (c.identificador_api_lyceum ?? c.id) !== key)
            );
        } else {
            setSelectedCursos(prev => [...prev, curso]);
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

    // Sincroniza "selecionar todos" com seleções individuais
    useEffect(() => {
        if (cursos.length > 0 && selectedCursos.length === cursos.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedCursos, cursos]);

    const handleConfirmSelection = () => {
        onCursosSelected(selectedCursos);
        setSelectedCursos([]);
        setSelectAll(false);
    };

    const cursosParaExibir = cursos;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            {/* Header com cor diferente para distinguir do modal pai */}
            <Modal.Header
                closeButton
                style={{ backgroundColor: '#0d6efd', color: '#fff' }}
            >
                <Modal.Title style={{ color: '#fff' }}>
                    🎓 Selecionar Cursos
                    {selectedCursos.length > 0 && (
                        <span
                            className="badge ms-2"
                            style={{ backgroundColor: '#fff', color: '#0d6efd', fontSize: '0.75rem' }}
                        >
                            {selectedCursos.length} selecionado(s)
                        </span>
                    )}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Carregando cursos disponíveis...</p>
                    </div>
                ) : error ? (
                    <Alert variant="danger">
                        <strong>Erro:</strong> {error}
                    </Alert>
                ) : cursosParaExibir.length > 0 ? (
                    <>
                        <Form.Check
                            type="checkbox"
                            label={<strong>Selecionar Todos ({cursosParaExibir.length})</strong>}
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="mb-3"
                        />
                        <Table striped bordered hover size="sm">
                            <thead style={{ backgroundColor: '#e8f4ff' }}>
                                <tr>
                                    <th style={{ width: 40 }}></th>
                                    <th>Código</th>
                                    <th>Curso</th>
                                    <th>Modalidade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursosParaExibir.map(curso => {
                                    const key = curso.identificador_api_lyceum ?? curso.id;
                                    const isSelected = selectedCursos.some(
                                        c => (c.identificador_api_lyceum ?? c.id) === key
                                    );
                                    return (
                                        <tr
                                            key={key}
                                            onClick={() => handleSelectCurso(curso)}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: isSelected ? '#dbeafe' : undefined,
                                            }}
                                        >
                                            <td onClick={e => e.stopPropagation()}>
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectCurso(curso)}
                                                />
                                            </td>
                                            <td>{curso.identificador_api_lyceum ?? curso.id ?? '—'}</td>
                                            <td>{curso.nome ?? curso.name ?? '—'}</td>
                                            <td>{curso.modalidade ?? '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </>
                ) : (
                    <div>
                        <Alert variant="warning">
                            Nenhum curso encontrado para as unidades selecionadas.
                        </Alert>
                        {/* Info de debug — remover depois de resolver */}
                        {debugInfo && (
                            <Alert variant="secondary" style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>
                                <strong>Debug:</strong> {debugInfo}
                            </Alert>
                        )}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <ButtonCancelar onClick={onHide}>Cancelar</ButtonCancelar>
                <ButtonCadastrar
                    onClick={handleConfirmSelection}
                    disabled={selectedCursos.length === 0}
                >
                    Confirmar Seleção ({selectedCursos.length})
                </ButtonCadastrar>
            </Modal.Footer>
        </Modal>
    );
}

export default CursoSelectionModal;