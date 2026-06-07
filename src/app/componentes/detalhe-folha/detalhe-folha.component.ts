import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DadosItemFolha,
  FolhaPagamento,
  ItemFolha,
  TipoItemFolha,
  calcularResumoFolha,
} from '../../modelos/folha-pagamento.model';
import { MoedaBrlPipe } from '../../utilitarios/moeda-brl.pipe';

@Component({
  selector: 'app-detalhe-folha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MoedaBrlPipe],
  templateUrl: './detalhe-folha.component.html',
  styleUrl: './detalhe-folha.component.css',
})
export class DetalheFolhaComponent implements OnChanges {
  @Input() folha?: FolhaPagamento;
  @Input() ocupado = false;
  @Output() nomeFuncionarioSalvo = new EventEmitter<string>();
  @Output() itemAdicionado = new EventEmitter<DadosItemFolha>();
  @Output() itemSalvo = new EventEmitter<{ itemId: number; dados: DadosItemFolha }>();
  @Output() itemRemovido = new EventEmitter<number>();
  @Output() fechada = new EventEmitter<void>();
  @Output() reaberta = new EventEmitter<void>();

  itemEmEdicaoId?: number;

  readonly funcionarioForm = this.fb.nonNullable.group({
    nomeFuncionario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
  });

  readonly itemForm = this.fb.nonNullable.group({
    descricao: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    tipo: this.fb.nonNullable.control<TipoItemFolha>('entrada', Validators.required),
    valor: [0, [Validators.required, Validators.min(0.01)]],
  });

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['folha']) {
      this.itemEmEdicaoId = undefined;
      this.itemForm.reset({ descricao: '', tipo: 'entrada', valor: 0 });
      this.funcionarioForm.reset({ nomeFuncionario: this.folha?.nomeFuncionario ?? '' });
      this.atualizarBloqueioForms();
    }
  }

  get estaFechada(): boolean {
    return this.folha?.status === 'fechada';
  }

  get resumo() {
    return calcularResumoFolha(this.folha?.itens ?? []);
  }

  salvarNomeFuncionario(): void {
    if (this.funcionarioForm.invalid || this.estaFechada) {
      this.funcionarioForm.markAllAsTouched();
      return;
    }

    this.nomeFuncionarioSalvo.emit(this.funcionarioForm.controls.nomeFuncionario.value);
  }

  salvarItem(): void {
    if (this.itemForm.invalid || this.estaFechada) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const dados = this.itemForm.getRawValue();
    if (this.itemEmEdicaoId) {
      this.itemSalvo.emit({ itemId: this.itemEmEdicaoId, dados });
    } else {
      this.itemAdicionado.emit(dados);
    }

    this.cancelarEdicaoItem();
  }

  editarItem(item: ItemFolha): void {
    if (this.estaFechada) {
      return;
    }

    this.itemEmEdicaoId = item.id;
    this.itemForm.setValue({
      descricao: item.descricao,
      tipo: item.tipo,
      valor: item.valor,
    });
  }

  cancelarEdicaoItem(): void {
    this.itemEmEdicaoId = undefined;
    this.itemForm.reset({ descricao: '', tipo: 'entrada', valor: 0 });
  }

  textoTipoItem(tipo: string): string {
    return tipo === 'entrada' ? 'Entrada' : 'Desconto';
  }

  private atualizarBloqueioForms(): void {
    if (this.estaFechada) {
      this.funcionarioForm.disable();
      this.itemForm.disable();
    } else {
      this.funcionarioForm.enable();
      this.itemForm.enable();
    }
  }
}
