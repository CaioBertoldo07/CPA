import React from 'react';
import {
    FormGroup,
    FormControlLabel,
    Checkbox,
    Typography,
    Box
} from '@mui/material';
import { useGetCategoriasQuery } from "../../hooks/queries/useCategoriaQueries";
import { useGetModalidadesQuery } from "../../hooks/queries/useModalidadeQueries";

const CategoryCheckboxes = ({ categorias = {}, onChange }) => {
    const { data: dataCategorias = [] } = useGetCategoriasQuery();

    const capitalize = (str) => {
        if (typeof str === 'string' && str.length > 0) {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }
        return '';
    };

    return (
        <Box sx={{ mt: 1 }}>
            <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
                {dataCategorias.map((categoria) => (
                    <FormControlLabel
                        key={categoria.id}
                        control={
                            <Checkbox
                                id={categoria.id?.toString()}
                                checked={!!categorias[categoria.id]}
                                onChange={onChange}
                                size="small"
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                {capitalize(categoria.nome)}
                            </Typography>
                        }
                    />
                ))}
            </FormGroup>
        </Box>
    );
};

const ModalityCheckboxes = ({ modalidades = {}, onChange }) => {
    const { data: dataModalidades = [] } = useGetModalidadesQuery();

    const capitalize = (str) => {
        if (typeof str === 'string' && str.length > 0) {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }
        return '';
    };

    return (
        <Box sx={{ mt: 1 }}>
            <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
                {dataModalidades.map((modalidade) => {
                    const id = modalidade.id;
                    const label = modalidade.mod_ensino.toLowerCase() === "especial"
                        ? capitalize(modalidade.mod_oferta)
                        : capitalize(modalidade.mod_ensino);

                    return (
                        <FormControlLabel
                            key={id}
                            control={
                                <Checkbox
                                    id={id?.toString()}
                                    checked={!!modalidades[id]}
                                    onChange={onChange}
                                    size="small"
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                    {label}
                                </Typography>
                            }
                        />
                    );
                })}
            </FormGroup>
        </Box>
    );
};

export { CategoryCheckboxes, ModalityCheckboxes };
