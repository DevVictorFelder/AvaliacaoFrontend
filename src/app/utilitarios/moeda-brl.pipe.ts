import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'moedaBrl',
  standalone: true,
})
export class MoedaBrlPipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  transform(value: number): string {
    return this.formatter.format(value);
  }
}
