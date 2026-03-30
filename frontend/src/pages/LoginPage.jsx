import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  Modal as MuiModal,
  Fade,
  Backdrop,
  Stack
} from '@mui/material';
import logo from '../assets/imgs/cpa_logo.svg';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../hooks/mutations/useAuthMutations';
import { getCurrentUser } from '../api/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showAdminOptions, setShowAdminOptions] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  useEffect(() => {
    document.title = 'CPA - UEA | Login';
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    loginMutation.mutate({ email, senha }, {
      onSuccess: async () => {
        const currentUser = await getCurrentUser();
        if (currentUser?.isAdmin) {
          setShowAdminOptions(true);
        } else {
          navigate('/alunos');
        }
      }
    });
  };

  const handleAreaSelection = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f8fafc',
      backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{
          p: 5,
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          textAlign: 'center',
          bgcolor: 'white'
        }}>
          <Box sx={{ mb: 4 }}>
            <img src={logo} alt="CPA Logo" style={{ height: 60, marginBottom: 16 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a202c', mb: 1 }}>
              Acesse sua conta
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Bem-vindo ao sistema da Comissão Própria de Avaliação
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="E-mail"
                variant="outlined"
                type="email"
                placeholder="exemplo@uea.edu.br"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                required
              />
              <TextField
                fullWidth
                label="Senha"
                variant="outlined"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Link href="#" variant="body2" sx={{ color: '#1D5E24', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Esqueci minha senha
                </Link>
              </Box>

              {loginMutation.isError && (
                <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
                  {loginMutation.error.response?.data?.message || loginMutation.error.message || 'Erro ao realizar login'}
                </Alert>
              )}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loginMutation.isPending}
                sx={{
                  mt: 2,
                  py: 1.5,
                  bgcolor: '#1D5E24',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#164a1c' }
                }}
              >
                {loginMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Realizar Login'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>

      {/* Admin Area Selection Modal */}
      <MuiModal
        open={showAdminOptions}
        onClose={() => setShowAdminOptions(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={showAdminOptions}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            textAlign: 'center'
          }}>
            <Typography id="transition-modal-title" variant="h6" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Escolha a área de acesso
            </Typography>
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleAreaSelection('/eixos')}
                sx={{ bgcolor: '#1D5E24', '&:hover': { bgcolor: '#164a1c' }, fontWeight: 600, py: 1.5, borderRadius: 2 }}
              >
                Área Administrativa
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleAreaSelection('/alunos')}
                sx={{ color: '#1D5E24', borderColor: '#1D5E24', '&:hover': { bgcolor: '#f0fdf4', borderColor: '#1D5E24' }, fontWeight: 600, py: 1.5, borderRadius: 2 }}
              >
                Área do Aluno
              </Button>
            </Stack>
          </Box>
        </Fade>
      </MuiModal>
    </Box>
  );
};

export default LoginPage;