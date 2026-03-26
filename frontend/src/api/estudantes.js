import axios from 'axios';

/**
 * Fetches the academic history/matriculation of a student for a specific year and semester.
 * Note: Using the full URL here as it's an external UEA API.
 */
export const getHistoricoMatricula = async (ano = 2024, semestre = 2) => {
    const response = await axios.get(`https://api.uea.edu.br/lyceum/cadu/aluno/historico/matriculapessoal/ano/${ano}/semestre/${semestre}`);
    return response.data;
};
