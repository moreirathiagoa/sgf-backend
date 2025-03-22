# SGFP - Sistema de Gerenciamento Financeiro Pessoal

Sistema para gestão dos gastos mensais e futuros, elaborado para uso pessoal, permitindo o usuário ter um controle melhor dos seus gastos

## Modulo

- **Backend**

## Instalando

- Execute o comando `npm install` para instalar as dependencias.

## Executando

- Execute o comando `npm run dev` para iniciar em modo desenvolvimento (apontando para **banco de dados teste**).
- Execute o comando `npm run prd` para iniciar em modo desenvolvimento (apontando para **banco de dados produtivo**).
- Execute o comando `npm start` para iniciar em modo produtivo (apontando para **banco de dados produtivo**).

Obs.: Nesse projeto nao está sendo utilizado banco de dados local, logo deverá ser criado arquivo `.env` com as credenciais do banco de dados. O token utilizado no **JWT** também deverá ser acrescentado nesse arquivo. Veja um exemplo:

```
DB_PASSWORD=ABC123
DB_USERNAME=USER_1
KEY_TOKEN=qwertyuiop1234567890
```

## Rodando os Testes

- Execute o comando `npm run test` para execução dos testes.

## Outras Funcionalidades

- O banco de dados de **testes** poderá facilmente clonado do banco de dados **produtivo** executando o comando `npm run clone-test`.

## Status do Projeto

- 🚀 Em construção | MVP Operacional 🚀

## Autor

- **Thiago Moreira** - moreira.thm@gmail.com
 