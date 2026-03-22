import React from 'react';
import { Autocomplete, TextField, Chip, Box } from '@mui/material';

/**
 * AnimatedMultiSelect - Standardized MUI version
 * 
 * @param {Array} options - [{ value, label }, ...]
 * @param {function} onChange - Call with (event, newValue)
 * @param {string} placeholder - Input placeholder
 * @param {Array} value - [{ value, label }, ...] current value
 */
export default function AnimatedMultiSelect({ options, onChange, placeholder, value }) {
    // Adapter to match the react-select onChange signature expected by the parent
    const handleChange = (event, newValue) => {
        // Parent expects an array of objects: [{ value, label }]
        onChange(newValue);
    };

    return (
        <Autocomplete
            multiple
            id="mui-multi-select"
            options={options}
            getOptionLabel={(option) => option.label}
            value={value || []}
            isOptionEqualToValue={(option, val) => option.value === val.value}
            onChange={handleChange}
            renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                    <Chip
                        variant="outlined"
                        label={option.label}
                        size="small"
                        color="primary"
                        {...getTagProps({ index })}
                    />
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    placeholder={placeholder}
                    size="small"
                />
            )}
            sx={{ width: '100%', mt: 1 }}
        />
    );
}
