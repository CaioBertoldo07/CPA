import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: '260px', // Match var(--sidebar-width) in Sidebar.css
                padding: '32px',
                minWidth: 0, // Prevent flex items from overflowing
                overflowY: 'auto'
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
