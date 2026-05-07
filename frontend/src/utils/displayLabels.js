const CATEGORIA_DISPLAY_MAP = {
    'TECNICO': 'Técnico Administrativo',
    'Técnico': 'Técnico Administrativo',
    'técnico': 'Técnico Administrativo',
    'TÉCNICO': 'Técnico Administrativo',
};

export function displayCategoriaNome(nome) {
    if (!nome) return nome;
    return CATEGORIA_DISPLAY_MAP[nome] ?? nome;
}
