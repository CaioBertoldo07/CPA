import React, { useEffect, useState } from 'react';
import './LoginPage.css';
import Button from '../components/Buttons/Button';
import Modal from 'react-bootstrap/Modal';
import logo from '../assets/imgs/cpa_logo.svg';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom'; // adicione

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showAdminOptions, setShowAdminOptions] = useState(false);
  const navigate = useNavigate(); // adicione

  useEffect(() => {
    document.title = 'CPA - UEA';
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { token, isAdmin } = await login(email, senha);
      localStorage.setItem('authToken', token);
      if (isAdmin) {
        setShowAdminOptions(true);
      } else {
        navigate('/alunos'); // troque window.location.href
      }
    } catch (err) {
      console.log(err);
      setErrorMessage(err.message);
    }
  };

  const handleAreaSelection = (path) => {
    navigate(path); // troque window.location.href
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="login-logo" />
      <p>ACESSE SUA CONTA</p>

      <form className="formLogin" onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail</label>
        <input
          type="email"
          placeholder="Digite seu e-mail"
          autoFocus={true}
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <label htmlFor="senha">Senha</label>
        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
        />
        <a href="/">Esqueci minha senha</a>
        <Button>Realizar Login</Button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>

      <Modal show={showAdminOptions} onHide={() => setShowAdminOptions(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Escolha a área de acesso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button onClick={() => handleAreaSelection('/eixos')} style={{ marginBottom: '10px' }}>
            Área Admin
          </Button>
          <Button onClick={() => handleAreaSelection('/alunos')}>
            Área Aluno
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LoginPage;