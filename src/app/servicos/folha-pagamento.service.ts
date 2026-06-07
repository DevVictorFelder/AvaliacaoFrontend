import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {
  DadosItemFolha,
  FolhaPagamento,
  ItemFolha,
  StatusFolha,
  calcularResumoFolha,
} from '../modelos/folha-pagamento.model';

@Injectable({ providedIn: 'root' })
export class FolhaPagamentoService {
  private readonly folhasSubject = new BehaviorSubject<FolhaPagamento[]>([]);

  private proximoIdFolha = 1;
  private proximoIdItem = 1;

  listarFolhas(status?: StatusFolha | 'todas'): Observable<FolhaPagamento[]> {
    return of(this.filtrarFolhas(status));
  }

  criarFolha(nomeFuncionario: string): Observable<FolhaPagamento> {
    const erro = this.validarNomeFuncionario(nomeFuncionario);
    if (erro) {
      return throwError(() => new Error(erro));
    }

    const agora = new Date();
    const folha: FolhaPagamento = {
      id: this.proximoIdFolha++,
      nomeFuncionario: nomeFuncionario.trim(),
      status: 'aberta',
      itens: [],
      criadaEm: agora,
      atualizadaEm: agora,
    };

    this.atualizarLista([folha, ...this.folhasAtuais]);
    return of(folha);
  }

  alterarNomeFuncionario(folhaId: number, nomeFuncionario: string): Observable<FolhaPagamento> {
    const folha = this.buscarFolha(folhaId);
    if (!folha) {
      return throwError(() => new Error('Folha de pagamento nao encontrada.'));
    }

    if (folha.status === 'fechada') {
      return throwError(() => new Error('Nao e possivel editar o funcionario de uma folha fechada.'));
    }

    const erro = this.validarNomeFuncionario(nomeFuncionario);
    if (erro) {
      return throwError(() => new Error(erro));
    }

    return this.atualizarFolha(folhaId, {
      nomeFuncionario: nomeFuncionario.trim(),
      atualizadaEm: new Date(),
    });
  }

  adicionarItem(folhaId: number, dados: DadosItemFolha): Observable<FolhaPagamento> {
    const folha = this.buscarFolha(folhaId);
    if (!folha) {
      return throwError(() => new Error('Folha de pagamento nao encontrada.'));
    }

    if (folha.status === 'fechada') {
      return throwError(() => new Error('Nao e possivel adicionar itens em uma folha fechada.'));
    }

    const erro = this.validarItem(dados);
    if (erro) {
      return throwError(() => new Error(erro));
    }

    const item: ItemFolha = {
      id: this.proximoIdItem++,
      descricao: dados.descricao.trim(),
      tipo: dados.tipo,
      valor: Number(dados.valor),
    };

    return this.atualizarFolha(folhaId, {
      itens: [...folha.itens, item],
      atualizadaEm: new Date(),
    });
  }

  alterarItem(folhaId: number, itemId: number, dados: DadosItemFolha): Observable<FolhaPagamento> {
    const folha = this.buscarFolha(folhaId);
    if (!folha) {
      return throwError(() => new Error('Folha de pagamento nao encontrada.'));
    }

    if (folha.status === 'fechada') {
      return throwError(() => new Error('Nao e possivel editar itens em uma folha fechada.'));
    }

    if (!folha.itens.some((item) => item.id === itemId)) {
      return throwError(() => new Error('Item nao encontrado.'));
    }

    const erro = this.validarItem(dados);
    if (erro) {
      return throwError(() => new Error(erro));
    }

    return this.atualizarFolha(folhaId, {
      itens: folha.itens.map((item) =>
        item.id === itemId
          ? {
              ...item,
              descricao: dados.descricao.trim(),
              tipo: dados.tipo,
              valor: Number(dados.valor),
            }
          : item,
      ),
      atualizadaEm: new Date(),
    });
  }

  removerItem(folhaId: number, itemId: number): Observable<FolhaPagamento> {
    const folha = this.buscarFolha(folhaId);
    if (!folha) {
      return throwError(() => new Error('Folha de pagamento nao encontrada.'));
    }

    if (folha.status === 'fechada') {
      return throwError(() => new Error('Nao e possivel remover itens de uma folha fechada.'));
    }

    return this.atualizarFolha(folhaId, {
      itens: folha.itens.filter((item) => item.id !== itemId),
      atualizadaEm: new Date(),
    });
  }

  removerFolha(folhaId: number): Observable<void> {
    this.atualizarLista(this.folhasAtuais.filter((folha) => folha.id !== folhaId));
    return of(undefined);
  }

  fecharFolha(folhaId: number): Observable<FolhaPagamento> {
    const folha = this.buscarFolha(folhaId);
    if (!folha) {
      return throwError(() => new Error('Folha de pagamento nao encontrada.'));
    }

    const { totalLiquido } = calcularResumoFolha(folha.itens);
    if (totalLiquido <= 0) {
      return throwError(() => new Error('Para fechar a folha, o total liquido deve ser maior que zero.'));
    }

    return this.atualizarFolha(folhaId, {
      status: 'fechada',
      atualizadaEm: new Date(),
    });
  }

  reabrirFolha(folhaId: number): Observable<FolhaPagamento> {
    return this.atualizarFolha(folhaId, {
      status: 'aberta',
      atualizadaEm: new Date(),
    });
  }

  private get folhasAtuais(): FolhaPagamento[] {
    return this.folhasSubject.getValue();
  }

  private atualizarLista(folhas: FolhaPagamento[]): void {
    this.folhasSubject.next(folhas);
  }

  private buscarFolha(folhaId: number): FolhaPagamento | undefined {
    return this.folhasAtuais.find((folha) => folha.id === folhaId);
  }

  private filtrarFolhas(status?: StatusFolha | 'todas'): FolhaPagamento[] {
    if (!status || status === 'todas') {
      return [...this.folhasAtuais];
    }

    return this.folhasAtuais.filter((folha) => folha.status === status);
  }

  private atualizarFolha(folhaId: number, alteracoes: Partial<FolhaPagamento>): Observable<FolhaPagamento> {
    const folha = this.buscarFolha(folhaId);
    if (!folha) {
      return throwError(() => new Error('Folha de pagamento nao encontrada.'));
    }

    const folhaAtualizada = { ...folha, ...alteracoes };
    this.atualizarLista(this.folhasAtuais.map((item) => (item.id === folhaId ? folhaAtualizada : item)));
    return of(folhaAtualizada);
  }

  private validarNomeFuncionario(nomeFuncionario: string): string | null {
    const nomeTratado = nomeFuncionario.trim();
    if (!nomeTratado) {
      return 'O nome do funcionario e obrigatorio.';
    }

    if (nomeTratado.length < 3 || nomeTratado.length > 200) {
      return 'O nome do funcionario deve ter entre 3 e 200 caracteres.';
    }

    return null;
  }

  private validarItem(dados: DadosItemFolha): string | null {
    const descricao = dados.descricao.trim();
    if (!descricao || !dados.tipo || dados.valor === null || dados.valor === undefined) {
      return 'Descricao, tipo e valor do item sao obrigatorios.';
    }

    if (descricao.length < 2 || descricao.length > 50) {
      return 'A descricao do item deve ter entre 2 e 50 caracteres.';
    }

    if (!Number.isFinite(Number(dados.valor)) || Number(dados.valor) <= 0) {
      return 'O valor do item deve ser maior que zero.';
    }

    return null;
  }
}
