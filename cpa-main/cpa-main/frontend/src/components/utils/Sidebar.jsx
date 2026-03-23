import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    RiDashboardLine,
    RiAdminLine,
    RiSettings4Line
} from 'react-icons/ri';
import {
    MdOutlineAccountTree,
    MdOutlineQuiz,
    MdOutlineAssignment,
    MdOutlineListAlt
} from 'react-icons/md';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { TbCategory } from 'react-icons/tb';
import { IoLogOutOutline } from 'react-icons/io5';
import { FiX } from 'react-icons/fi';
import logo from '../../assets/imgs/cpa_logo.svg';
import './Sidebar.css';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const email = localStorage.getItem('userEmail') || 'Usuário';
        setUserEmail(email);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    const navItems = [
        { path: '/relatorios', icon: <RiDashboardLine size={20} />, label: 'Dashboard' },
        { path: '/eixos', icon: <MdOutlineAccountTree size={20} />, label: 'Eixos/Dimensões' },
        { path: '/modalidades', icon: <HiOutlineBuildingOffice2 size={20} />, label: 'Modalidades' },
        { path: '/categorias', icon: <TbCategory size={20} />, label: 'Categorias' },
        { path: '/padraoresposta', icon: <MdOutlineListAlt size={20} />, label: 'Padrões de Resposta' },
        { path: '/questoes', icon: <MdOutlineQuiz size={20} />, label: 'Questões' },
        { path: '/avaliacoes', icon: <MdOutlineAssignment size={20} />, label: 'Avaliações' },
        { path: '/admin', icon: <RiAdminLine size={20} />, label: 'Admins' },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                {/* Close Button for Mobile */}
                <button
                    className="mobile-close"
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'absolute',
                        right: '16px',
                        top: '24px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: window.innerWidth <= 768 ? 'block' : 'none'
                    }}
                >
                    <FiX size={20} />
                </button>
                <div className="logo-container unified-logo">
                    <img src={logo} alt="CPA Logo" className="sidebar-logo" />
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <span className="user-email" title={userEmail}>{userEmail}</span>
                </div>
                <NavLink to="/settings" className="nav-item footer-item">
                    <span className="nav-icon"><RiSettings4Line size={20} /></span>
                    <span className="nav-label">Settings</span>
                </NavLink>
                <button onClick={handleLogout} className="nav-item footer-item logout-btn">
                    <span className="nav-icon"><IoLogOutOutline size={20} /></span>
                    <span className="nav-label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
