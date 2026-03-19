// src/components/utils/SearchBar.js
import './Search.css';
import React from 'react';
import { CiSearch } from "react-icons/ci";

/**
 * SearchBar reutilizável com filtragem real.
 * Props:
 *   - value: string (valor controlado)
 *   - onChange: fn(newValue: string) — callback disparado a cada tecla
 *   - placeholder: string (opcional)
 */
function SearchBar({ value = '', onChange, placeholder = '    Pesquisar...' }) {
    const handleChange = (e) => {
        if (onChange) onChange(e.target.value);
    };

    return (
        <div>
            <div className="search-container">
                <CiSearch className="search-icon" />
                <input
                    type="text"
                    className="form-control"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}

export default SearchBar;