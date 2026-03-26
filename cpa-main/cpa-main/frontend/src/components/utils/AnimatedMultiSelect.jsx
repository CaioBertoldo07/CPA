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
export default function AnimatedMultiSelect({ options, onChange, placeholder, value, disabled }) {
    // Adapter to match the react-select onChange signature expected by the parent
    const handleChange = (event, newValue) => {
        // Parent expects an array of objects: [{ value, label }]
        onChange(newValue);
    };

    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            id="mui-multi-select"
            options={options}
            getOptionLabel={(option) => option.label}
            value={value || []}
            isOptionEqualToValue={(option, val) => option.value === val.value}
            onChange={handleChange}
            disabled={disabled}
            renderOption={(props, option) => (
                <li {...props} key={`${option.value}-${option.label}`}>
                    {option.label}
                </li>
            )}
            renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                    <Chip
                        key={`${option.value}-${index}`}
                        variant="outlined"
                        label={option.label}
                        size="small"
                        color="primary"
                        {...getTagProps({ index })}
                        // Remove the key from tagProps since we're passing it explicitly
                        {...(({ key, ...rest }) => rest)(getTagProps({ index }))}
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
