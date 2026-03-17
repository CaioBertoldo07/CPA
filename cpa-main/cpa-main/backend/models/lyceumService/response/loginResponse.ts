interface LoginResponse {
    APILYCEUM: {
      usuario: {
        Sistema: string;
        Descricao: string;
        Versao: string;
        Instituicao: string;
        Desenvolvimento: string;
        Ano: string;
        DataHoraToken: string;
        Iat: number;
        Exp: number;
        Matricula: string;
        Cpf: string;
        Usuario: string;
        UsuarioId: string;
        UsuarioNome: string;
        UnidadeId: string;
        UnidadeSigla: string;
        UnidadeNome: string;
        OberonPerfilid: string;
        OberonPerfilNome: string;
        PerfilSistema: string[]; // assuming it's a JSON array represented as a string
        Ip: string;
        App: string;
      };
      status: boolean;
      token: string;
    };
  }

  export default LoginResponse;