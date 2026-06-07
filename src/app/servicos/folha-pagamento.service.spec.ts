import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { FolhaPagamentoService } from './folha-pagamento.service';

describe('FolhaPagamentoService', () => {
  let service: FolhaPagamentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FolhaPagamentoService);
  });

  it('cria uma folha com nome valido', async () => {
    const folha = await firstValueFrom(service.criarFolha('Carlos Lima'));

    expect(folha.nomeFuncionario).toBe('Carlos Lima');
    expect(folha.status).toBe('aberta');
    expect(folha.itens).toEqual([]);
  });

  it('filtra folhas por status', async () => {
    const folhaAberta = await firstValueFrom(service.criarFolha('Mariana Costa'));
    await firstValueFrom(service.adicionarItem(folhaAberta.id, { descricao: 'Salario', tipo: 'entrada', valor: 2500 }));
    await firstValueFrom(service.fecharFolha(folhaAberta.id));
    await firstValueFrom(service.criarFolha('Rafael Nunes'));

    const abertas = await firstValueFrom(service.listarFolhas('aberta'));
    const fechadas = await firstValueFrom(service.listarFolhas('fechada'));

    expect(abertas.length).toBeGreaterThan(0);
    expect(fechadas.length).toBeGreaterThan(0);
    expect(abertas.every((folha) => folha.status === 'aberta')).toBeTrue();
    expect(fechadas.every((folha) => folha.status === 'fechada')).toBeTrue();
  });

  it('recusa nome de funcionario invalido', async () => {
    await expectAsync(firstValueFrom(service.criarFolha('Al'))).toBeRejectedWithError(
      'O nome do funcionario deve ter entre 3 e 200 caracteres.',
    );
  });

  it('impede adicionar item em folha fechada', async () => {
    const folha = await firstValueFrom(service.criarFolha('Juliana Alves'));
    await firstValueFrom(service.adicionarItem(folha.id, { descricao: 'Salario', tipo: 'entrada', valor: 3000 }));
    await firstValueFrom(service.fecharFolha(folha.id));

    await expectAsync(
      firstValueFrom(service.adicionarItem(folha.id, { descricao: 'Bonus', tipo: 'entrada', valor: 100 })),
    ).toBeRejectedWithError('Nao e possivel adicionar itens em uma folha fechada.');
  });

  it('impede fechar folha com total liquido menor ou igual a zero', async () => {
    const folha = await firstValueFrom(service.criarFolha('Daniel Reis'));
    await expectAsync(firstValueFrom(service.fecharFolha(folha.id))).toBeRejectedWithError(
      'Para fechar a folha, o total liquido deve ser maior que zero.',
    );
  });
});
