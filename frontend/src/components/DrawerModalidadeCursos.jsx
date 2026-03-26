import React, { useMemo } from 'react';
import { useGetCursosByModalidadesQuery } from '../hooks/queries/useCursoQueries';

const IconClose = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const SkeletonRow = () => (
    <div style={{
        height: 42,
        borderRadius: 8,
        background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
        backgroundSize: '400% 100%',
        animation: 'skPulse 1.4s ease infinite',
        marginBottom: 8,
    }} />
);

const DrawerModalidadeCursos = ({ open, onClose, modalidade }) => {
    const modalidadeId = modalidade?.id;
    const { data: cursos = [], isLoading } = useGetCursosByModalidadesQuery(modalidadeId ? [modalidadeId] : []);

    const rows = useMemo(() => {
        return (cursos || []).map((curso) => ({
            id: curso.id,
            codigo: curso.identificador_api_lyceum || '-',
            nome: curso.nome || '-',
        }));
    }, [cursos]);

    return (
        <>
            <style>{`@keyframes skPulse { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>

            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 1200,
                    background: 'rgba(15,23,42,0.45)',
                    backdropFilter: 'blur(2px)',
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? 'all' : 'none',
                    transition: 'opacity 280ms ease',
                }}
            />

            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 460, zIndex: 1300,
                background: '#f8fafc',
                boxShadow: '-6px 0 40px rgba(0,0,0,0.16)',
                display: 'flex', flexDirection: 'column',
                transform: open ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 320ms cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#fff', borderBottom: '1px solid #e2e8f0',
                }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a202c' }}>Cursos da Modalidade</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                            {modalidade?.mod_ensino || '-'}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        title="Fechar"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 30, height: 30, borderRadius: 8,
                            border: '1px solid #e2e8f0', background: '#fff',
                            cursor: 'pointer', color: '#4a5568',
                        }}
                    >
                        <IconClose />
                    </button>
                </div>

                <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                    <div style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Total de cursos
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1a202c', marginTop: 4 }}>
                        {isLoading ? '-' : rows.length}
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                    {isLoading ? (
                        <>
                            <SkeletonRow />
                            <SkeletonRow />
                            <SkeletonRow />
                        </>
                    ) : rows.length === 0 ? (
                        <div style={{
                            marginTop: 24,
                            border: '1px dashed #cbd5e1',
                            borderRadius: 10,
                            background: '#fff',
                            padding: 16,
                            textAlign: 'center',
                            color: '#64748b',
                            fontSize: 13,
                        }}>
                            Nenhum curso vinculado a esta modalidade.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 8 }}>
                            {rows.map((row) => (
                                <div key={row.id} style={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 10,
                                    padding: '10px 12px',
                                    display: 'grid',
                                    gridTemplateColumns: '130px 1fr',
                                    gap: 12,
                                    alignItems: 'center',
                                }}>
                                    <span style={{
                                        fontFamily: 'monospace',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: '#475569',
                                        background: '#f1f5f9',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        padding: '4px 8px',
                                        width: 'fit-content',
                                    }}>
                                        {row.codigo}
                                    </span>
                                    <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{row.nome}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DrawerModalidadeCursos;
