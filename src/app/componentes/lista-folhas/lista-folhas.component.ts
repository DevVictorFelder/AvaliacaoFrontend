import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FolhaPagamento, StatusFolha, calcularResumoFolha } from '../../modelos/folha-pagamento.model';
import { MoedaBrlPipe } from '../../utilitarios/moeda-brl.pipe';

@Component({
  selector: 'app-lista-folhas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MoedaBrlPipe],
  templateUrl: './lista-folhas.component.html',
  styleUrl: './lista-folhas.component.css',
})
export class ListaFolhasComponent {
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) folhas: FolhaPagamento[] = [];
  @Input() folhaSelecionadaId?: number;
  @Input() carregando = false;
  @Input() recolhida = false;
  @Output() selecionada = new EventEmitter<FolhaPagamento>();
  @Output() removida = new EventEmitter<number>();
  @Output() filtroAlterado = new EventEmitter<StatusFolha | 'todas'>();
  @Output() recolhimentoAlterado = new EventEmitter<void>();

  readonly filtroControl = new FormControl<StatusFolha | 'todas'>('todas', { nonNullable: true });

  constructor() {
    this.filtroControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => this.filtroAlterado.emit(status));
  }

  totalLiquido(folha: FolhaPagamento): number {
    return calcularResumoFolha(folha.itens).totalLiquido;
  }

  textoStatus(status: StatusFolha): string {
    return status === 'aberta' ? 'Em aberto' : 'Fechada';
  }

  identificarFolha(_: number, folha: FolhaPagamento): number {
    return folha.id;
  }
}
