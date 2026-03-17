import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, NavLink } from 'react-bootstrap';
import logo from '../../assets/imgs/cpa_logo.svg';
import './NavBar.css';
import { Link, useNavigate } from 'react-router-dom';

const NavigationBar = () => {
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const email = localStorage.getItem('userEmail') || 'Usuário não identificado';
        setUserEmail(email);
        console.log('NavigationBar carregada');
        console.log(`Usuário logado: ${email}`);
    }, []);

    const handleLogout = () => {
        // Remove o token e o email do localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');

        // Redireciona para a página de login
        navigate('/login');
    };

    return (
        <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
            <Container>
                <div className="nav-logo">
                    <Navbar.Brand as={Link} to="">
                        <img
                            src={logo}
                            width="90"
                            height=""
                            className="position-absolute top-0 start-0"
                            alt="Logo"
                        />
                    </Navbar.Brand>
                </div>

                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="position-absolute top-0 end-0">
                        <Nav.Link as={Link} to="/eixos">Eixos e dimensões</Nav.Link>
                        <Nav.Link as={Link} to="/modalidades">Modalidades</Nav.Link>
                        <Nav.Link as={Link} to="/categorias">Categorias</Nav.Link>
                        <NavLink as={Link} to="/padraoresposta">Padrão de Resposta</NavLink>
                        <Nav.Link as={Link} to="/questoes">Questões</Nav.Link>
                        <Nav.Link as={Link} to="/avaliacoes">Avaliações</Nav.Link>
                        <Nav.Link as={Link} to="/relatorios">Relatórios</Nav.Link>
                        <Nav.Link as={Link} to="/admin">Admins</Nav.Link>
                        <NavDropdown title={userEmail} id="user-dropdown">
                            <NavDropdown.Item onClick={handleLogout}>Sair</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavigationBar;
