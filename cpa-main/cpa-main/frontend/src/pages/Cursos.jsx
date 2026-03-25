import React, { useState } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import Table_Cursos from '../components/Tables/Table_Cursos';
import { IoSearchOutline } from 'react-icons/io5';

const Cursos = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                    <Box>
                        <Typography 
                            variant="h4" 
                            component="h1" 
                            sx={{ 
                                fontWeight: 700, 
                                color: 'primary.main',
                                mb: 0.5
                            }}
                        >
                            Gestão de Cursos
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Visualize e gerencie todos os cursos integrados do sistema Lyceum.
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ mt: 3 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5, 
                        background: '#fff', 
                        border: '1.5px solid #e2e8f0', 
                        borderRadius: '10px', 
                        padding: '10px 18px', 
                        maxWidth: 450, 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        transition: 'all 0.2s',
                        '&:focus-within': {
                            borderColor: '#1D5E24',
                            boxShadow: '0 0 0 3px rgba(29,94,36,0.1)'
                        }
                    }}>
                        <IoSearchOutline color="#9ca3af" size={20} />
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            placeholder="Pesquisar por nome, código, unidade ou município..." 
                            style={{ 
                                border: 'none', 
                                outline: 'none', 
                                background: 'transparent', 
                                fontSize: '14px', 
                                color: '#1a202c', 
                                width: '100%', 
                                fontFamily: 'inherit' 
                            }} 
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')} 
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        )}
                    </Box>
                </Box>
            </Box>

            <Paper 
                elevation={0} 
                sx={{ 
                    p: 0, 
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
            >
                <Table_Cursos 
                    searchQuery={searchTerm} 
                    externalSelectedTypes={selectedTypes}
                    onExternalTypesChange={setSelectedTypes}
                />
            </Paper>
        </Container>
    );
};

export default Cursos;
