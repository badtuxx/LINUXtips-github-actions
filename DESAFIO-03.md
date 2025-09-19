# Desafio 03 – Containers e Segurança (GHCR)

Opa, beleza? Foi mal estar atrapalhando seu sextou aí, mas a gente tá com um problema aqui na empresa e precisamos da sua ajuda. Seguinte, aquela aplicação que implementamos os pipelines iniciais de setup e os testes agora está sofrendo uma modernização e vai passar a utilizar docker. Com isso, precisamos que você crie pra gente um terceiro pipeline que faça o seguinte:

## Requisitos do pipeline

- Deve existir um novo workflow do GitHub Actions para o Nível 3 (containers e segurança).
- O disparo deve acontecer quando um Pull Request para a branch `main` for fechado com merge (evento `pull_request`, `types: [closed]` + condição `github.event.pull_request.merged == true`).
- O workflow deve:
  - Fazer login no GitHub Container Registry (GHCR) utilizando `GITHUB_TOKEN`.
  - Montar a tag da imagem sempre com o SHA do commit, e com `owner`, `IMAGE_NAME` e `registry` em minúsculas.
  - Executar lint do `Dockerfile` com **Hadolint**, salvando o resultado em `lint-report.txt` e falhando se forem encontrados os problemas **DL3006** ou **DL3008**.
  - Buildar a imagem Docker para permitir o scan de vulnerabilidades.
  - Executar o scan de vulnerabilidades com **Trivy** na imagem construída.
    - O resultado deve ser salvo em um relatório `trivy-report.txt` e publicado como artefato, mesmo que não haja falhas.
    - O workflow deve falhar caso o Trivy encontre vulnerabilidades de severidade **CRITICAL**.
  - Executar um **smoke test** da imagem rodando `node --version`. Caso não haja saída, o job deve falhar.
  - Somente publicar no GHCR se **todas** as validações acima forem aprovadas.
  - Gerar o artefato `level-3-certificate.md` (não alterar a seção do certificado, assim como nos desafios anteriores).

### Importante: Proteção de branch

Antes de executar, configure a proteção da branch `main` como mostramos na live de quarta. Isso garante a qualidade do ciclo de revisão e evita merges diretos na `main` sem validações. Veja a demonstração aqui: [AO VIVO - Descomplicando Github Actions - Resolvendo Desafio](https://www.youtube.com/watch?v=VihvfGx58IY).

## Variável obrigatória

- Crie uma variável de repositório chamada `IMAGE_NAME` (em: Settings > Secrets and variables > Actions > Variables) com o nome da aplicação a ser usada no nome da imagem (ex.: `desafio3-linuxtips-gha`).
- Essa variável é obrigatória e será utilizada para compor o nome final da imagem no GHCR.

## Actions obrigatórias

Você deve utilizar exatamente estas actions nas versões a seguir:

- `docker/login-action@v3`
- `docker/build-push-action@v6`
- `aquasecurity/trivy-action@0.28.0`
- `docker/build-push-action@v6`

### Política de lint (Hadolint)

Para nós, os checks do Hadolint devem focar nos itens que mais impactam segurança e reprodutibilidade. Portanto, este pipeline deve falhar apenas quando forem detectadas as regras abaixo:

- DL3006: uso consistente e fixação do gerenciador de pacotes/base da imagem (garante builds reprodutíveis);
- DL3008: instalação de pacotes sem pin de versões (evita deriva de dependências e janelas de vulnerabilidade).

Por política da empresa e conformidade de supply chain, consideramos DL3006 e DL3008 bloqueadores.

## Regras de publicação da imagem

- **Registry**: `ghcr.io`
- **Tag obrigatória**: o SHA do commit (`${{ github.sha }}`)
- **Nome completo (exemplo)**: `ghcr.io/<owner>/<IMAGE_NAME>:<sha>`
- O nome completo deve ser convertido para minúsculas para evitar erros no push.

## Critérios de aceite

- [ ] Workflow Nível 3 dispara somente após PR mergeado na `main`.
- [ ] `Dockerfile` analisado com **Hadolint**; gerar artefato `lint-report.txt`.
- [ ] O workflow falha se Hadolint encontrar **DL3006** ou **DL3008**
- [ ] Build local com **Trivy**.
- [ ] Relatório `trivy-report.txt` gerado e publicado como artefato.
- [ ] Workflow falha se o scan encontrar vulnerabilidades CRITICAL.
- [ ] Smoke test da imagem executa `node --version` e falha se não houver saída.
- [ ] Push realizado no GHCR apenas se todas as verificações passarem.
- [ ] Uso das actions nas versões exigidas.

Boa sorte e nos vemos no sábado, dia 20/09, para resolver esse desafio na nossa live das 13h

#VAI
