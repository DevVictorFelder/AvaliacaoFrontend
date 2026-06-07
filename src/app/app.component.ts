import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { DadosItemFolha, FolhaPagamento, StatusFolha } from './modelos/folha-pagamento.model';
import { DetalheFolhaComponent } from './componentes/detalhe-folha/detalhe-folha.component';
import { ListaFolhasComponent } from './componentes/lista-folhas/lista-folhas.component';
import { FolhaPagamentoService } from './servicos/folha-pagamento.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ListaFolhasComponent, DetalheFolhaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly chaveTema = 'folhas-pagamento-tema';

  folhas: FolhaPagamento[] = [];
  folhaSelecionada?: FolhaPagamento;
  filtroStatus: StatusFolha | 'todas' = 'todas';
  carregando = false;
  ocupado = false;
  mensagemErro = '';
  listaRecolhida = false;
  temaEscuro = false;

  readonly novaFolhaForm = this.fb.nonNullable.group({
    nomeFuncionario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly folhaService: FolhaPagamentoService,
  ) {}

  ngOnInit(): void {
    this.carregarTemaSalvo();
    this.carregarFolhas();
  }

  carregarFolhas(status: StatusFolha | 'todas' = this.filtroStatus): void {
    this.filtroStatus = status;
    this.carregando = true;
    this.limparErro();

    this.folhaService
      .listarFolhas(status)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.carregando = false)),
      )
      .subscribe({
        next: (folhas) => {
          this.folhas = folhas;
          this.sincronizarFolhaSelecionada();
        },
        error: (erro: Error) => this.exibirErro(erro.message),
      });
  }

  criarFolha(): void {
    if (this.novaFolhaForm.invalid) {
      this.novaFolhaForm.markAllAsTouched();
      return;
    }

    this.ocupado = true;
    this.limparErro();
    this.folhaService
      .criarFolha(this.novaFolhaForm.controls.nomeFuncionario.value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.ocupado = false)),
      )
      .subscribe({
        next: (folha) => {
          this.folhaSelecionada = folha;
          this.novaFolhaForm.reset({ nomeFuncionario: '' });
          this.carregarFolhas();
        },
        error: (erro: Error) => this.exibirErro(erro.message),
      });
  }

  selecionarFolha(folha: FolhaPagamento): void {
    this.folhaSelecionada = folha;
    this.limparErro();
  }

  alternarLista(): void {
    this.listaRecolhida = !this.listaRecolhida;
  }

  alternarTema(): void {
    this.aplicarTema(!this.temaEscuro);
  }

  removerFolha(folhaId: number): void {
    this.ocupado = true;
    this.limparErro();
    this.folhaService
      .removerFolha(folhaId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.ocupado = false)),
      )
      .subscribe({
        next: () => {
          if (this.folhaSelecionada?.id === folhaId) {
            this.folhaSelecionada = undefined;
          }
          this.carregarFolhas();
        },
        error: (erro: Error) => this.exibirErro(erro.message),
      });
  }

  salvarNomeFuncionario(nomeFuncionario: string): void {
    if (!this.folhaSelecionada) {
      return;
    }

    this.executarAlteracaoFolha(this.folhaService.alterarNomeFuncionario(this.folhaSelecionada.id, nomeFuncionario));
  }

  adicionarItem(dados: DadosItemFolha): void {
    if (!this.folhaSelecionada) {
      return;
    }

    this.executarAlteracaoFolha(this.folhaService.adicionarItem(this.folhaSelecionada.id, dados));
  }

  salvarItem(evento: { itemId: number; dados: DadosItemFolha }): void {
    if (!this.folhaSelecionada) {
      return;
    }

    this.executarAlteracaoFolha(this.folhaService.alterarItem(this.folhaSelecionada.id, evento.itemId, evento.dados));
  }

  removerItem(itemId: number): void {
    if (!this.folhaSelecionada) {
      return;
    }

    this.executarAlteracaoFolha(this.folhaService.removerItem(this.folhaSelecionada.id, itemId));
  }

  fecharFolha(): void {
    if (!this.folhaSelecionada) {
      return;
    }

    this.executarAlteracaoFolha(this.folhaService.fecharFolha(this.folhaSelecionada.id));
  }

  reabrirFolha(): void {
    if (!this.folhaSelecionada) {
      return;
    }

    this.executarAlteracaoFolha(this.folhaService.reabrirFolha(this.folhaSelecionada.id));
  }

  private executarAlteracaoFolha(alteracao$: Observable<FolhaPagamento>): void {
    this.ocupado = true;
    this.limparErro();
    alteracao$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.ocupado = false)),
      )
      .subscribe({
        next: (folha) => {
          this.folhaSelecionada = folha;
          this.carregarFolhas();
        },
        error: (erro: Error) => this.exibirErro(erro.message),
      });
  }

  private sincronizarFolhaSelecionada(): void {
    if (this.folhas.length === 0) {
      this.folhaSelecionada = undefined;
      return;
    }

    this.folhaSelecionada =
      this.folhas.find((folha) => folha.id === this.folhaSelecionada?.id) ?? this.folhas[0];
  }

  private exibirErro(mensagem: string): void {
    this.mensagemErro = mensagem;
  }

  private limparErro(): void {
    this.mensagemErro = '';
  }

  private carregarTemaSalvo(): void {
    this.aplicarTema(localStorage.getItem(this.chaveTema) === 'escuro');
  }

  private aplicarTema(escuro: boolean): void {
    this.temaEscuro = escuro;
    document.documentElement.dataset['tema'] = escuro ? 'escuro' : 'claro';
    localStorage.setItem(this.chaveTema, escuro ? 'escuro' : 'claro');
  }
}
