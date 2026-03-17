import './Search.css';
import React from 'react';
import { CiSearch } from "react-icons/ci";

function SearchBar() {
    return (
        <div > 
            <div className="search-container">
                <CiSearch className="search-icon" />
                <input type="text" className="form-control" placeholder={"    Search..."} />
            </div>
        </div>
    );
}

export default SearchBar;