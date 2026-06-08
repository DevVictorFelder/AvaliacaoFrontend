# Folhas de Pagamento

Sistema web desenvolvido em Angular para gerenciamento de folhas de pagamento de funcionários, permitindo o controle de lançamentos, cálculos e fechamento de folhas de forma simples e intuitiva.

## Demonstração

🔗 **Aplicação Online:** https://avaliacao-frontend-devvictorfelders-projects.vercel.app?_vercel_share=iPCeQeNbnVaO75PFBkw3LsB7mElZX127

## Tecnologias Utilizadas

* Angular
* TypeScript
* RxJS
* Angular Forms
* Angular Router
* HTML5
* CSS3

## Funcionalidades

### Gestão de Folhas

* Cadastro de folhas de pagamento
* Edição de folhas existentes
* Exclusão de folhas
* Consulta de folhas cadastradas
* Filtro por status

### Gestão de Itens

* Inclusão de proventos
* Inclusão de descontos
* Edição de itens
* Remoção de itens
* Cálculo automático do total líquido

### Controle de Status

* Fechamento de folhas
* Reabertura de folhas
* Bloqueio de alterações em folhas fechadas

## Regras de Negócio

### Folha de Pagamento

* Nome do funcionário é obrigatório
* Nome deve possuir entre 3 e 200 caracteres
* Folhas fechadas não podem ser editadas
* Uma folha somente pode ser fechada quando o valor líquido for maior que zero

### Itens da Folha

* Descrição obrigatória
* Descrição entre 2 e 50 caracteres
* Tipo obrigatório
* Valor obrigatório
* Valor deve ser maior que zero
* Itens não podem ser alterados após o fechamento da folha

## Arquitetura

O projeto foi desenvolvido seguindo boas práticas do Angular, utilizando:

* Componentização
* Separação de responsabilidades
* Serviços para gerenciamento de dados
* Observables (RxJS)
* Validações reativas
* Estrutura preparada para integração com APIs REST

## Estrutura do Projeto

```text
src/
├── app/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── models/
│   └── shared/
├── assets/
└── environments/
```

## Deploy

O projeto encontra-se publicado na plataforma Vercel e disponível para acesso online.

## Autor
**Victor Felder**
