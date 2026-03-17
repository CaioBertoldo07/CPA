import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { getCategorias } from "../../services/categoriasService";
import { getModalidades } from "../../services/modalidadesService";

const CategoryCheckboxes = ({ categorias = {}, onChange }) => {
    const [dataCategorias, setDataCategorias] = useState([]);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const categorias = await getCategorias();
                setDataCategorias(categorias);
            } catch (error) {
                console.error('Erro ao buscar categorias:', error);
            }
        };

        fetchCategorias();
    }, []);

    const capitalize = (str) => {
        if (typeof str === 'string' && str.length > 0) {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }
        return '';
    };

    return (
        <div className="input-checkbox">
            {dataCategorias.map((categoria) => (
                //     <Form.Check
                //     key={categoria.id}
                //     custom
                //     type="checkbox"
                //     id={`categoria-${categoria.id}`}  // Usando o id como parte do id do checkbox
                //     label={capitalize(categoria.nome)}
                //     checked={!!categorias[categoria.id]}  // Verificando o id da categoria no estado
                //     onChange={onChange}
                // />
                <Form.Check
                    key={categoria.id}
                    custom
                    type="checkbox"
                    id={categoria.id}  // Usando o id como parte do id do checkbox
                    label={capitalize(categoria.nome)}
                    checked={!!categorias[categoria.id]}  // Verificando o id da categoria no estado
                    onChange={onChange}
                />
            ))}
        </div>
    );
};

const ModalityCheckboxes = ({ modalidades, onChange }) => {
    const [dataModalidades, setDataModalidades] = useState([]);

    useEffect(() => {
        const fetchModalidades = async () => {
            try {
                const modalidades = await getModalidades();
                setDataModalidades(modalidades);
            } catch (error) {
                console.error('Erro ao buscar modalidades:', error);
            }
        };
        fetchModalidades();
    }, []);

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
