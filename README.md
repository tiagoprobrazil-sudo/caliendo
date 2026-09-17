# CALIENDO PSI

Site institucional de Eduardo Caliendo, reconstruído a partir das referências visuais fornecidas. O projeto entrega HTML no servidor, usa TypeScript e está preparado para Cloudflare Workers, com GitHub como fonte oficial do código.

Domínio de produção previsto: **https://caliendopsi.com.br**.

O projeto pode ser executado e validado localmente. A conexão com um repositório GitHub, a primeira publicação e a ativação do domínio dependem das contas do responsável; esses serviços não são criados pelo build. O domínio será conectado posteriormente.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Páginas e SSR | Astro 7.3.3 |
| Runtime de produção | Cloudflare Workers, adaptador `@astrojs/cloudflare` 14.3.2 |
| Ferramentas Cloudflare | Wrangler 4.133.0 |
| Linguagem e apresentação | TypeScript, HTML semântico e CSS |
| Build e desenvolvimento | Node.js 24.12.0 e npm |
| Imagens | Derivados locais preparados antes do build |
| Qualidade | Astro Check, ESLint e verificação HTTP de rotas |

As versões efetivamente instaladas estão em `package-lock.json`. Use `npm ci` para reproduzi-las. O racional da arquitetura está em [docs/architecture.md](docs/architecture.md).

## Instalação e desenvolvimento

Requisitos: Node.js 24.12.0, npm e Git. A instalação inicial precisa de acesso ao registro npm. Conta Cloudflare e repositório GitHub são necessários apenas para a publicação.

Na raiz `caliendo`, execute:

```sh
npm ci
npm run assets
npm run dev
```

Abra a URL apresentada pelo terminal. No PowerShell com bloqueio a scripts `.ps1`, use `npm.cmd` no lugar de `npm`; não é necessário alterar a política de execução do sistema.

O ambiente de desenvolvimento e o preview do adaptador utilizam o runtime `workerd`. Não introduza dependências de filesystem ou de um servidor Node persistente nas páginas SSR.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desenvolvimento com atualização automática |
| `npm run assets` | Preparação dos derivados das referências originais |
| `npm run check` | Verificação dos componentes Astro e tipos TypeScript |
| `npm run lint` | Análise estática com ESLint |
| `npm run build` | Preparação dos assets e compilação de produção |
| `npm run preview` | Execução local do resultado do build |
| `npm run validate` | Check, lint e build, nessa ordem |
| `npm run test:smoke` | Verificação HTTP contra o servidor de preview |
| `npm run deploy` | Publicação protegida pelo script de CI/Git |

Para validar uma alteração:

```sh
npm run validate
npm run preview
```

Com o preview em execução, execute `npm run test:smoke` em outro terminal. Consulte `scripts/smoke.mjs` para a URL padrão e os parâmetros aceitos. Confira também o menu por teclado, o foco, links de contato e as larguras de 320, 375, 768, 1024 e 1440 pixels. Verifique o console e a aba Network: imagens, fontes, CSS e scripts devem carregar sem erros.

A resposta HTTP de `/` precisa conter o texto principal e os metadados antes da execução de JavaScript. Uma rota inexistente deve responder com status 404. A política CSP deve ser conferida no **preview de produção**, pois o servidor de desenvolvimento tem necessidades diferentes.

Resultados de Lighthouse dependem do dispositivo, rede e ambiente. Métricas de usuários reais, como INP e percentis de Core Web Vitals, só podem ser confirmadas após tráfego de produção; não há nota garantida ou medição de campo embutida neste projeto.

## Estrutura

```text
caliendo/
├── *.jpg                    # As cinco referências originais, preservadas
├── docs/                    # Decisões e documentação
├── public/                  # Arquivos servidos como assets estáticos
│   └── images/              # Imagens derivadas para o site
├── scripts/                 # Preparação, smoke test e proteção de deploy
├── src/
│   ├── components/          # Elementos compartilhados
│   ├── data/                # Conteúdo e dados públicos do site
│   ├── layouts/             # Documento HTML e metadados
│   ├── pages/               # Páginas e endpoints
│   └── styles/              # Estilos e regras responsivas
├── astro.config.mjs         # SSR e integração Cloudflare
├── wrangler.jsonc           # Configuração do Worker
├── package.json             # Comandos e dependências
└── package-lock.json        # Dependências reproduzíveis
```

| Rota | Conteúdo |
| --- | --- |
| `/` | Apresentação, abordagem e contato |
| `/privacidade/` | Informações sobre privacidade e links externos |
| `/robots.txt` | Diretivas para mecanismos de busca |
| `/sitemap.xml` | URLs públicas do domínio oficial |
| Qualquer rota inexistente | Página 404, com status HTTP correspondente |

## Referências e conteúdo

Os cinco JPGs da raiz são originais de referência e não devem ser apagados. Há três imagens distintas e duas cópias duplicadas. `scripts/prepare-assets.mjs` produz os arquivos utilizados pelo site; alterações nos derivados devem ser reproduzíveis pelo script.

Identidade visual, retrato, composição e texto identificável nas referências orientam a implementação. O conteúdo identifica **Eduardo Caliendo — Psicanalista / Filósofo**. Os contatos fornecidos são WhatsApp **+55 21 99864-6217**, e-mail **eduvelloso@gmail.com** e Instagram **@holisticamente**. Não há formulário de coleta de dados, ferramenta de analytics ou sessão de usuário.

Antes de publicar, o responsável deve confirmar os contatos e a localização. A referência contém a grafia “Pontal de oceânico”; o site utiliza apenas **Recreio dos Bandeirantes, Rio de Janeiro**, até confirmação. Modalidades de atendimento, preços, formação, registros profissionais, experiência e resultados clínicos não foram presumidos. Alterações nessas informações devem usar dados fornecidos pelo responsável.

## Variáveis de ambiente e secrets

O site atual não precisa de credenciais em tempo de execução. Nome, contatos e domínio são informações públicas, mantidas no código. Preserve `.env*` e `.dev.vars*` fora do Git, conforme `.gitignore`; modelos sem valores sensíveis podem ser versionados.

Para uma integração futura, use secrets do Worker em **Workers & Pages → worker → Settings → Variables and Secrets → Add → Secret**. Variáveis de build ficam na seção **Settings → Build**, separadas das variáveis de runtime. Prefixar uma variável com `PUBLIC_` torna seu valor apropriado para exposição ao navegador; nunca faça isso com tokens. Consulte a [documentação oficial de secrets](https://developers.cloudflare.com/workers/configuration/secrets/).

O CI de Workers Builds fornece metadados como `CI`, `WORKERS_CI`, `WORKERS_CI_BRANCH` e `WORKERS_CI_COMMIT_SHA`. Esses valores identificam o build; não são credenciais de acesso.

## GitHub como fonte oficial

Crie o repositório na organização ou conta escolhida, envie o projeto e use `main` como branch de produção. Se esta pasta ainda não for um repositório, os comandos iniciais são:

```sh
git init -b main
git add .
git commit -m "Implementa site CALIENDO PSI com SSR"
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

Substitua os dois campos da URL pelo repositório real. Se o Git já estiver inicializado, confira `git status` e `git remote -v` antes de configurar o remoto. Mantenha o lockfile, os arquivos de configuração, os originais e os scripts no Git; exclua dependências instaladas, diretórios de build e secrets.

No GitHub, acesse **Settings → Rules → Rulesets** e crie uma regra para `main`: exija pull request e os checks de CI configurados no repositório. Trabalho novo deve entrar por branch e PR. A rotina de publicação é:

```text
Alteração local → commit/PR no GitHub → validação → merge em main
                                                    ↓
                                           Workers Builds
                                                    ↓
                                           Cloudflare Workers
```

O script `scripts/deploy.mjs` verifica o contexto de CI/Git antes da publicação. Ele evita um deploy local acidental, mas não substitui as permissões das contas. Restrinja quem pode editar builds e publicar Workers; não utilize o editor de código do painel como fluxo de manutenção.

## Conectar GitHub ao Workers Builds

Após revisar o repositório:

1. No painel Cloudflare, abra **Workers & Pages → Create application → Import a repository**.
2. Conecte o GitHub e permita acesso ao repositório escolhido.
3. Escolha o repositório, branch `main` e diretório raiz `.`. O nome do Worker deve corresponder a `name` em `wrangler.jsonc`.
4. Configure **Build command** como `npm ci && npm run validate` e **Deploy command** como `npm run deploy`.
5. Na configuração do build, defina `NODE_VERSION=24.12.0`. Mantenha Wrangler como dependência versionada do projeto.
6. Selecione **Save and Deploy** quando estiver pronto para a primeira publicação. A Cloudflare disponibilizará a URL `workers.dev`.

Em **worker → Settings → Build → Branch control**, habilite builds para branches de desenvolvimento. Configure **Non-production branch deploy command** como `npx wrangler versions upload`. Esse comando cria uma versão de preview; não promove a branch de desenvolvimento para produção. Revise a URL de preview antes do merge. Detalhes estão nas documentações de [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) e [controle de branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/).

Os comandos do painel são a configuração inicial da integração. Todo código de aplicação e toda mudança posterior devem vir do GitHub. Workers Builds não utiliza automaticamente a seção de custom build do Wrangler; mantenha o comando de build explícito. [Configuração de Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## Conectar `caliendopsi.com.br` posteriormente

1. Adicione o domínio à conta Cloudflare e conclua a ativação da zona. Se necessário, atualize os nameservers no registrador para os valores exibidos pela Cloudflare, preservando os registros DNS existentes, especialmente de e-mail.
2. Quando a zona estiver ativa e o site revisado, adicione a propriedade abaixo ao `wrangler.jsonc`, mantendo as demais configurações:

   ```json
   "routes": [
     { "pattern": "caliendopsi.com.br", "custom_domain": true }
   ]
   ```

3. Faça commit, abra o PR e integre em `main`. O próximo deploy aplica o domínio pelo código versionado.
4. Confira **Workers & Pages → worker → Settings → Domains & Routes** e a emissão do certificado. A associação de Custom Domain administra DNS e certificado para esse hostname. [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).
5. Valide HTTPS, conteúdo SSR, canonical, sitemap, robots e links de contato no domínio final. Confirme que previews e URLs temporárias não sejam indexados.

Se o domínio for vinculado pelo painel, o caminho é **Settings → Domains & Routes → Add → Custom Domain**; registre a mesma rota no Wrangler antes do próximo deploy para manter a configuração sincronizada. Não ative `www` sem também definir no código seu redirecionamento permanente para o domínio canônico. O projeto não depende de um servidor de origem separado.

## Headers de segurança, cache e redirecionamento `www`

A Content-Security-Policy é gerada automaticamente pelo Astro a partir de `security.csp` em `astro.config.mjs`, com hashes por build para o único script inline (dados estruturados JSON-LD). `src/middleware.ts` complementa cada resposta SSR com `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e `Strict-Transport-Security`, e responde com 308 a qualquer requisição para `www.caliendopsi.com.br`, redirecionando para o domínio canônico e preservando path e query string. Esse redirecionamento só entra em vigor quando o domínio `www` também estiver roteado para o mesmo Worker; veja a seção de domínio acima.

Cache de assets estáticos é definido em `public/_headers`: `/images/*`, `/favicon.png` e `/apple-touch-icon.png` recebem cache de uma semana com revalidação. O adaptador da Cloudflare adiciona automaticamente, no build, uma regra de cache imutável de um ano para os arquivos com hash em `/_astro/*`. Respostas SSR (`/`, `/privacidade/`) não recebem cache estático; a estratégia de cache de borda para HTML, se necessária, deve ser configurada como Cache Rule na Cloudflare após observar o tráfego real.

## Rollback pelo Git

Identifique o commit que introduziu o problema, crie uma branch de correção e use `git revert SHA_DO_COMMIT`. Depois execute `npm run validate`, envie um PR e integre em `main`. O Workers Builds publica o estado corrigido. Para reverter um merge, selecione conscientemente o parent adequado; não reescreva o histórico de `main`.

Uma recuperação emergencial pelo histórico de versões da Cloudflare deve ser acompanhada pelo revert correspondente no GitHub antes da próxima publicação. Assim, o próximo deploy não reintroduz o problema.

## Manutenção

Atualize dependências deliberadamente, gere o lockfile e execute a validação completa. Teste mudanças no runtime e na `compatibility_date` em preview. Ao substituir imagens ou fontes, confira peso, proporções, direitos de uso e referências originais. Se forem adicionados formulários, analytics ou serviços externos, revise privacidade, CSP e necessidade real de armazenamento antes da integração.
