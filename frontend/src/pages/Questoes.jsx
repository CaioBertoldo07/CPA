import React, { useState, useMemo } from 'react';
import TableQuestoes from '../components/Tables/Table_Questoes';
import ModalQuestoes from '../components/Modals/Modal_Questoes';
import AnimatedMultiSelect from '../components/utils/AnimatedMultiSelect';
import { useNotification } from '../context/NotificationContext';
import { useGetEixosQuery } from '../hooks/queries/useEixoQueries';
import { useGetDimensoesQuery } from '../hooks/queries/useDimensaoQueries';
import { useGetCategoriasQuery } from '../hooks/queries/useCategoriaQueries';

const filterLabelStyle = {
    fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block'
};

const Questoes = () => {
    const [modalShow, setModalShow] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEixos, setSelectedEixos] = useState([]);
    const [selectedDimensoes, setSelectedDimensoes] = useState([]);
    const [selectedCategorias, setSelectedCategorias] = useState([]);

    const showNotification = useNotification();

    const { data: eixosData, isLoading: isLoadingEixos } = useGetEixosQuery();
    const { data: dimensoesData, isLoading: isLoadingDimensoes } = useGetDimensoesQuery();
    const { data: categoriasData, isLoading: isLoadingCategorias } = useGetCategoriasQuery();

    const eixosOptions = useMemo(() =>
        eixosData?.map(e => ({ value: e.numero, label: `${e.numero}. ${e.nome}` })) ?? [],
        [eixosData]);

    const dimensoesOptions = useMemo(() => {
        if (!dimensoesData) return [];
        let filtered = dimensoesData;
        if (selectedEixos.length > 0) {
            const eixoIds = selectedEixos.map(e => e.value);
            filtered = dimensoesData.filter(d => eixoIds.includes(d.numero_eixos));
        }
        return filtered.map(d => ({ value: d.numero, label: d.nome }));
    }, [dimensoesData, selectedEixos]);

    const categoriasOptions = useMemo(() =>
        categoriasData?.map(c => ({ value: c.id, label: c.nome })) ?? [],
        [categoriasData]);

    // Limpar dimensões selecionadas se deixarem de pertencer aos eixos selecionados
    React.useEffect(() => {
        if (selectedEixos.length > 0 && selectedDimensoes.length > 0) {
            const eixoIds = selectedEixos.map(e => e.value);
            const validDimensoes = selectedDimensoes.filter(sd => {
                const dim = dimensoesData?.find(d => d.numero === sd.value);
                return dim && eixoIds.includes(dim.numero_eixos);
            });
            if (validDimensoes.length !== selectedDimensoes.length) {
                setSelectedDimensoes(validDimensoes);
            }
        } else if (selectedEixos.length === 0 && selectedDimensoes.length > 0) {
            // Se nenhum eixo selecionado, teoricamente todas as dimensões são válidas ou nenhuma?
            // O usuário disse: "se eu escolher o eixo primeiro vai aparecer somente as dimensoes dele"
            // Se ele desmarcar todos os eixos, as dimensões continuam lá?
            // Geralmente é melhor deixar, mas se for estritamente hierárquico pode limpar.
            // Para ser seguro e evitar confusão, vou manter as dimensões se nenhum eixo estiver selecionado (mostra todas).
        }
    }, [selectedEixos, dimensoesData, selectedDimensoes]);

    // Chamado quando questão é criada OU atualizada com sucesso
    const handleSuccess = (message) => {
        showNotification(message || 'Operação realizada!', 'success');
    };

    // Chamado quando o modal é fechado sem sucesso (botão Cancelar ou X)
    const handleHide = () => {
        setModalShow(false);
    };

    return (
        <>
            <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

            <div style={{ width: '100%' }}>

                {/* ── Cabeçalho ── */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 16, marginBottom: 28,
                    paddingBottom: 20, borderBottom: '1px solid #e2e8f0',
                }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a202c', margin: '0 0 3px' }}>Questões</h1>
                        <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>Gerencie o banco de questões avaliativas</p>
                    </div>
                    <button
                        onClick={() => setModalShow(true)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '9px 20px', background: '#1D5E24', color: '#fff',
                            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', boxShadow: '0 2px 8px rgba(29,94,36,0.25)',
                            transition: 'all 150ms', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#256428'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#1D5E24'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                        Nova Questão
                    </button>
                </div>

                {/* ── Filtros Avançados ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 24, padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div>
                        <label style={filterLabelStyle}>Eixo</label>
                        <AnimatedMultiSelect placeholder="Selecione os eixos" options={eixosOptions} value={selectedEixos} onChange={setSelectedEixos} disabled={isLoadingEixos} />
                    </div>
                    <div>
                        <label style={filterLabelStyle}>Dimensão</label>
                        <AnimatedMultiSelect placeholder={selectedEixos.length === 0 ? "Selecione um eixo primeiro" : "Selecione as dimensões"} options={dimensoesOptions} value={selectedDimensoes} onChange={setSelectedDimensoes} disabled={isLoadingDimensoes} />
                    </div>
                    <div>
                        <label style={filterLabelStyle}>Categorias</label>
                        <AnimatedMultiSelect placeholder="Selecione as categorias" options={categoriasOptions} value={selectedCategorias} onChange={setSelectedCategorias} disabled={isLoadingCategorias} />
                    </div>
                </div>

                {/* ── Search bar ── */}
                <div style={{ marginBottom: 20 }}>
                    <div
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: '#fff', border: '1.5px solid #e2e8f0',
                            borderRadius: 10, padding: '10px 16px', maxWidth: 420,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            transition: 'border-color 150ms, box-shadow 150ms',
                        }}
                        onFocusCapture={e => { e.currentTarget.style.borderColor = '#1D5E24'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29,94,36,0.1)'; }}
                        onBlurCapture={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text" value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar questões..."
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1a202c', width: '100%', fontFamily: 'inherit' }}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Tabela ── */}
                <div style={{
                    background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    overflowX: 'auto', animation: 'fadeInUp 400ms 150ms both',
                }}>
                    <TableQuestoes
                        searchQuery={searchQuery}
                        onSuccess={handleSuccess}
                        selectedEixoIds={selectedEixos.map(e => e.value)}
                        selectedDimensaoIds={selectedDimensoes.map(d => d.value)}
                        selectedCategoriaIds={selectedCategorias.map(c => c.value)}
                        eixosOptions={eixosOptions}
                        dimensoesOptions={dimensoesOptions}
                        categoriasOptions={categoriasOptions}
                    />
                </div>
            </div>

            <ModalQuestoes
                show={modalShow}
                onHide={handleHide}             // ← fecha sem reload
                questao={null}
                onSuccess={handleSuccess}       // ← fecha + reload + toast
                onUpdateQuestion={handleSuccess}
            />
        </>
    );
};

export default Questoes;