import React, { useState, useRef } from 'react';
import NavigationBar from '../components/utils/NavBar';
import TableEixos from '../components/Tables/TableEixos';
import ModalEixos from '../components/Modals/Modal_Eixos';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Eixos = () => {
    const [modalShow, setModalShow] = useState(false);
    const [updateTable, setUpdateTable] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useRef(null);

    const handleSuccess = (message) => {
        setUpdateTable(prev => !prev);
        toast.current?.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: message || 'Operação realizada com sucesso!',
            life: 3000,
        });
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
            <NavigationBar />
            <Toast ref={toast} />

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 48px' }}>

                {/* ── Cabeçalho ── */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', flexWrap: 'wrap',
                    gap: 16, marginBottom: 28,
                    paddingBottom: 20, borderBottom: '1px solid #e2e8f0',
                }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a202c', margin: '0 0 3px', lineHeight: 1.2 }}>
                            Eixos e Dimensões
                        </h1>
                        <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
                            Gerencie a estrutura de eixos temáticos e suas dimensões avaliativas
                        </p>
                    </div>
                    <button
                        onClick={() => setModalShow(true)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '9px 20px',
                            background: '#1D5E24', color: '#fff',
                            border: 'none', borderRadius: 10,
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(29,94,36,0.25)',
                            transition: 'all 150ms ease',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#256428'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#1D5E24'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                        </svg>
                        Novo Eixo
                    </button>
                </div>

                {/* ── Search bar ── */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#fff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 10,
                        padding: '10px 16px',
                        maxWidth: 420,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        transition: 'border-color 150ms, box-shadow 150ms',
                    }}
                        onFocusCapture={e => { e.currentTarget.style.borderColor = '#1D5E24'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29,94,36,0.1)'; }}
                        onBlurCapture={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar eixos ou dimensões..."
                            style={{
                                border: 'none', outline: 'none', background: 'transparent',
                                fontSize: 13, color: '#1a202c', width: '100%',
                                fontFamily: 'inherit',
                            }}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    overflow: 'hidden',
                    animation: 'fadeInUp 400ms both',
                }}>
                    <TableEixos
                        updateTable={updateTable}
                        searchQuery={searchQuery}
                        onSuccess={handleSuccess}
                    />
                </div>
            </div>

            <ModalEixos
                show={modalShow}
                onHide={() => setModalShow(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default Eixos;