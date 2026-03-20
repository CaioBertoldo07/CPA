import React, { useRef, useState } from 'react';
import NavigationBar from '../components/utils/NavBar';
import TableQuestoes from '../components/Tables/Table_Questoes';
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

    // Chamado quando questão é criada OU atualizada com sucesso
    const handleSuccess = (message) => {
        setUpdateTable(prev => !prev);   // dispara reload da tabela
        toast.current?.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: message || 'Operação realizada!',
            life: 3000,
        });
    };

    // Chamado quando o modal é fechado sem sucesso (botão Cancelar ou X)
    const handleHide = () => {
        setModalShow(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
            <NavigationBar />
            <Toast ref={toast} />
            <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 48px' }}>

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
                            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                        </svg>
                        Nova Questão
                    </button>
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
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p style={{ fontSize: 12, color: '#718096', marginTop: 6, marginLeft: 2 }}>
                            Filtrando por "{searchQuery}"
                        </p>
                    )}
                </div>

                {/* ── Tabela ── */}
                <div style={{
                    background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    overflow: 'hidden', animation: 'fadeInUp 400ms 150ms both',
                }}>
                    <TableQuestoes
                        searchQuery={searchQuery}
                        updateTable={updateTable}    // ← chave que dispara reload
                        onSuccess={handleSuccess}
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
        </div>
    );
};

export default Questoes;