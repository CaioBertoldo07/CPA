import React from 'react';
import { Form } from 'react-bootstrap';
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
        <div className="input-checkbox">
            {dataCategorias.map((categoria) => (
                <Form.Check
                    key={categoria.id}
                    custom
                    type="checkbox"
                    id={categoria.id}
                    label={capitalize(categoria.nome)}
                    checked={!!categorias[categoria.id]}
                    onChange={onChange}
                />
            ))}
        </div>
    );
};

const ModalityCheckboxes = ({ modalidades, onChange }) => {
    const { data: dataModalidades = [] } = useGetModalidadesQuery();

    const capitalize = (str) => {
        if (typeof str === 'string' && str.length > 0) {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }
        return '';
    };

    return (
        <div className="input-checkbox">
            {dataModalidades.map((modalidade) => {
                const id = modalidade.id;
                const label = modalidade.mod_ensino.toLowerCase() === "especial"
                    ? capitalize(modalidade.mod_oferta)
                    : capitalize(modalidade.mod_ensino);

                return (
                    <Form.Check
                        key={id}
                        custom
                        type="checkbox"
                        id={id}
                        label={label}
                        checked={modalidades[id] || false}
                        onChange={onChange}
                    />
                );
            })}
        </div>
    );
};

export { CategoryCheckboxes, ModalityCheckboxes };
