import { calcularResumoFolha } from './folha-pagamento.model';

describe('calcularResumoFolha', () => {
  it('calcula entradas, descontos e total liquido', () => {
    const resumo = calcularResumoFolha([
      { id: 1, descricao: 'Salario', tipo: 'entrada', valor: 3000 },
      { id: 2, descricao: 'Bonus', tipo: 'entrada', valor: 500 },
      { id: 3, descricao: 'INSS', tipo: 'desconto', valor: 350 },
    ]);

    expect(resumo).toEqual({
      entradas: 3500,
      descontos: 350,
      totalLiquido: 3150,
    });
  });
});
