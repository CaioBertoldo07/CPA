import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const CopyField = ({ label, value, fieldKey, copiedField, onCopy }) => {
    const copied = copiedField === fieldKey;
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>
                    {label}
                </label>
                <button
                    onClick={() => onCopy(value, fieldKey)}
                    style={{
                        padding: '3px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6,
                        border: `1px solid ${copied ? '#22c55e' : '#e2e8f0'}`,
                        background: copied ? '#dcfce7' : '#f8fafc',
                        color: copied ? '#166534' : '#64748b',
                        cursor: 'pointer', transition: 'all 150ms',
                    }}
                >
                    {copied ? 'Copiado!' : 'Copiar'}
                </button>
            </div>
            <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '10px 14px', fontSize: 13, color: '#1a202c',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6,
            }}>
                {value}
            </div>
        </div>
    );
};

const Modal_EmailTemplate = ({ show, onHide, emailTemplate }) => {
    const [copiedField, setCopiedField] = useState(null);
    const [copyError, setCopyError] = useState(false);

    if (!emailTemplate) return null;

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setCopyError(false);
            setTimeout(() => setCopiedField(null), 2000);
        }).catch(() => {
            setCopyError(true);
            setTimeout(() => setCopyError(false), 3000);
        });
    };

    const handleCopyAll = () => {
        const full = `Assunto: ${emailTemplate.subject}\n\n${emailTemplate.body}`;
        handleCopy(full, 'all');
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
                <Modal.Title style={{ fontSize: 16, fontWeight: 700, color: '#1a202c' }}>
                    Template de E-mail — Divulgação da Avaliação
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '24px' }}>
                <p style={{ fontSize: 13, color: '#718096', marginBottom: 20, marginTop: 0 }}>
                    Copie o conteúdo abaixo e envie manualmente por e-mail para os avaliadores.
                    Nenhum e-mail é enviado automaticamente.
                </p>
                {copyError && (
                    <p style={{ fontSize: 12, color: '#b91c1c', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, padding: '6px 12px', marginBottom: 16 }}>
                        Não foi possível copiar. Selecione o texto manualmente.
                    </p>
                )}

                <CopyField
                    label="Assunto"
                    value={emailTemplate.subject}
                    fieldKey="subject"
                    copiedField={copiedField}
                    onCopy={handleCopy}
                />
                <CopyField
                    label="Corpo do e-mail"
                    value={emailTemplate.body}
                    fieldKey="body"
                    copiedField={copiedField}
                    onCopy={handleCopy}
                />
                <CopyField
                    label="Link do sistema"
                    value={emailTemplate.systemUrl}
                    fieldKey="systemUrl"
                    copiedField={copiedField}
                    onCopy={handleCopy}
                />
            </Modal.Body>
            <Modal.Footer style={{ borderTop: '1px solid #e2e8f0', padding: '12px 24px', gap: 8 }}>
                <Button
                    variant="success"
                    size="sm"
                    onClick={handleCopyAll}
                    style={{ fontWeight: 600 }}
                >
                    {copiedField === 'all' ? 'Copiado!' : 'Copiar Tudo'}
                </Button>
                <Button variant="light" size="sm" onClick={onHide} style={{ fontWeight: 600 }}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default Modal_EmailTemplate;
