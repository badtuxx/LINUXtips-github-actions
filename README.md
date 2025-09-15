# Descomplicando GitHub Actions

Se inscreva na aula ao vivo e gratuita: https://quiz.linuxtips.io/github-actions

Bem-vindo ao **Descomplicando GitHub Actions**! Este projeto foi criado pela comunidade **LINUXtips** para você aprender os conceitos básicos de CI/CD na prática de forma simples e direta.

Este projeto foi desenhado para ser o material de apoio do vídeo "Descomplicando GitHub Actions" no [canal da LINUXtips no YouTube](https://youtube.com/linuxtips). A ideia é que você possa codificar junto e aprender na prática.

## O que você vai aprender

Neste projeto você aprenderá:

- **Estrutura de um workflow**: jobs, steps, actions do marketplace
- **Como usar actions prontas**: `actions/checkout`, `actions/setup-node`
- **Executar comandos**: instalação de dependências, build, testes e cobertura
- **Health checks**: verificar se sua aplicação está funcionando
- **Artefatos**: gerar certificados de conclusão dos níveis 1 e 2

## Como Começar

1.  **Fork este Repositório:**
    Clique no botão **"Fork"** no canto superior direito desta página para criar uma cópia deste projeto na sua própria conta do GitHub.

2.  **Clone o seu Fork:**
    ```bash
    git clone https://github.com/SEU-USUARIO-GITHUB/LINUXtips-github-actions.git
    cd LINUXtips-github-actions
    ```

3.  **Habilite os GitHub Actions:**
    Vá para a aba **"Actions"** do seu repositório e clique no botão verde **"I understand my workflows, go ahead and enable them"**.

4.  **Instale as Dependências:**
    Você precisa do Node.js (versão 16 ou superior):
    ```bash
    npm install
    ```

5.  **Teste a Aplicação Localmente:**
    ```bash
    npm start
    ```
    Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

6.  **Execute seu Primeiro Workflow:**
    - Faça uma alteração simples (ex: adicione seu nome no README.md)
    - Faça commit e push
    - Vá para a aba "Actions" e veja seu primeiro workflow rodando!

## O que acontece nos Workflows?

O arquivo `01-basic-ci.yml` (Nível 1) demonstra:

1. **Setup do Ambiente**: Configuração do Node.js
2. **Verificação da Estrutura**: Validação dos arquivos do projeto
3. **Build**: Executar o comando de build
4. **Health Check**: Testar se a aplicação inicia corretamente
5. **Certificado**: Gerar um artefato com seu certificado de conclusão (level-1-certificate)

O arquivo `02-tests-ci.yml` (Nível 2) demonstra:

1. **Testes Automatizados**: Executar Jest com cobertura
2. **Cobertura Mínima**: Validar cobertura mínima definida por `COVERAGE_MIN` (80%)
3. **Certificado**: Gerar um artefato com seu certificado do nível 2 (level-2-certificate)

## Badges Conquistados

Ao completar cada workflow com sucesso, você ganha os badges:

![Desafio 01 Concluído](https://img.shields.io/badge/Desafio_01-Concluído-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white)

![Desafio 02 Concluído](https://img.shields.io/badge/Desafio_02-Concluído-8a2be2?style=for-the-badge&logo=github&logoColor=white)

## Entendendo o Código

- **`server.js`**: Aplicação Express simples com dashboard e API
- **`public/`**: Interface web que mostra seu progresso
- **`package.json`**: Dependências e scripts do Node.js
- **`.github/workflows/01-basic-ci.yml`**: Seu primeiro workflow do GitHub Actions

## Agradecimentos

- Ao **Jeferson Fernando** e toda a comunidade **LINUXtips** por inspirar e fomentar a educação em tecnologia no Brasil.
- A todos os contribuidores que ajudarem a tornar este projeto ainda melhor.

---

**Feito pela comunidade LINUXtips.**


