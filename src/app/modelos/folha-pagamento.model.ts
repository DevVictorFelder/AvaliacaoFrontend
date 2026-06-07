export type StatusFolha = 'aberta' | 'fechada';
export type TipoItemFolha = 'entrada' | 'desconto';

export interface ItemFolha {
  id: number;
  descricao: string;
  tipo: TipoItemFolha;
  valor: number;
}

export interface FolhaPagamento {
  id: number;
  nomeFuncionario: string;
  status: StatusFolha;
  itens: ItemFolha[];
  criadaEm: Date;
  atualizadaEm: Date;
}

export interface DadosItemFolha {
  descricao: string;
  tipo: TipoItemFolha;
  valor: number;
}

export interface ResumoFolha {
  entradas: number;
  descontos: number;
  totalLiquido: number;
}

export function calcularResumoFolha(itens: ItemFolha[]): ResumoFolha {
  return itens.reduce<ResumoFolha>(
    (resumo, item) => {
      if (item.tipo === 'entrada') {
        resumo.entradas += item.valor;
      } else {
        resumo.descontos += item.valor;
      }

      resumo.totalLiquido = resumo.entradas - resumo.descontos;
      return resumo;
    },
    { entradas: 0, descontos: 0, totalLiquido: 0 },
  );
}
