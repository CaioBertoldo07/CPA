// src/components/AnimatedMultiSelect.js
import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

export default function AnimatedMultiSelect({ options, onChange, placeholder, defaultValue }) {
    return (
        <Select
            closeMenuOnSelect={false}
            components={animatedComponents}
            isMulti
            options={options}
            placeholder={placeholder}
            onChange={onChange}
            defaultValue={defaultValue}
        />
    );
}
