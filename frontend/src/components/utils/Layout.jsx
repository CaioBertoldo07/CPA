import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { FiMenu } from 'react-icons/fi';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', position: 'relative' }}>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Hamburger Button for Mobile */}
            {!isSidebarOpen && (
                <button
                    onClick={toggleSidebar}
                    style={{
                        position: 'fixed',
                        top: '20px',
                        left: '20px',
                        zIndex: 1100,
                        background: '#1D5E24',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(29, 94, 36, 0.2)',
                    }}
                    className="mobile-toggle"
                >
                    <FiMenu size={20} />
                </button>
            )}

            <main style={{
                flex: 1,
                marginLeft: isSidebarOpen && window.innerWidth > 768 ? '260px' : '0',
                padding: '32px',
                minWidth: 0,
                transition: 'margin-left 0.3s ease',
                width: '100%'
            }}>
                {children}
            </main>

            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && window.innerWidth <= 768 && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(2px)',
                        zIndex: 999
                    }}
                />
            )}
        </div>
    );
};

export default Layout;
