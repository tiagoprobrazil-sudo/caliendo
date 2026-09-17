# Arquitetura — CALIENDO PSI

Decisão registrada em 16 de setembro de 2026. A implementação atende ao pedido de SSR real em Cloudflare, preserva as referências fornecidas e concentra a manutenção no GitHub.

## Material de origem

A pasta inicial continha apenas cinco arquivos JPG, sem aplicação, configuração de hospedagem, fontes isoladas ou código reaproveitável. Não foram encontrados arquivos `AGENTS.md` aplicáveis na pasta nem em seus diretórios ascendentes examinados.

| Arquivo original | Tamanho |
| --- | ---: |
| `27979788-6ae6-4b21-a1ba-9e3e6a277ea1.jpg` | 74.919 bytes |
| `72fe7814-36c8-42b6-bcac-f1a21735fdfa.jpg` | 90.696 bytes |
| `72fe7814-36c8-42b6-bcac-f1a21735fdfa (1).jpg` | 90.696 bytes |
| `fd3b5963-4f21-4c26-8bdf-c0a37c183455.jpg` | 125.693 bytes |
| `fd3b5963-4f21-4c26-8bdf-c0a37c183455 (1).jpg` | 125.693 bytes |

Os três materiais distintos são a fonte visual da reconstrução. As duas cópias duplicadas permanecem preservadas, assim como os demais originais. O site usa derivados em `public/images`, gerados por `scripts/prepare-assets.mjs`; referências não devem ser substituídas pelos arquivos otimizados.

O conteúdo legível identifica Eduardo Caliendo como psicanalista e filósofo. Telefones, e-mail e perfil social foram transcritos das referências. A grafia “Pontal de oceânico” precisa de confirmação; a localização pública foi limitada a Recreio dos Bandeirantes, Rio de Janeiro. Não se pressupõem preços, modalidades, registros profissionais, formação ou resultados de atendimento.

## Escolha da stack

Astro favorece este site de conteúdo: componentes de servidor produzem HTML completo e a interatividade pontual pode usar JavaScript pequeno, sem incorporar um framework de interface no navegador. CSS e TypeScript são suficientes para a interface prevista. Não há necessidade de estado global, SPA, banco de dados ou CMS nesta etapa.

A versão adotada é **Astro 7.3.3**, com **`@astrojs/cloudflare` 14.3.2**, **Wrangler 4.133.0** e **Node.js 24.12.0**. O anúncio oficial de [Astro 7.3](https://astro.build/blog/astro-730/) confirma a linha estável disponível na data da decisão. O lockfile fixa as dependências utilizadas em cada build.

Cloudflare Workers executa o SSR e serve os assets pela infraestrutura da Cloudflare. O adaptador atual integra `workerd` ao desenvolvimento e ao preview, reduzindo diferenças de runtime. Sua entrada é `@astrojs/cloudflare/entrypoints/server`; tutoriais antigos que apontam diretamente para `dist/_worker.js/index.js` não devem orientar esta configuração. O adaptador moderno deixou de oferecer Cloudflare Pages. [Documentação do adaptador](https://docs.astro.build/en/guides/integrations-guide/cloudflare/).

## Renderização e rotas

`output: 'server'` torna a renderização no servidor o padrão. As páginas públicas contêm texto, navegação, headings, canonical e demais metadados no HTML da resposta. A ausência de JavaScript no navegador não deve impedir a leitura do conteúdo ou os links de contato.

| Rota | Responsabilidade |
| --- | --- |
| `/` | Apresentação e contato |
| `/privacidade/` | Informações sobre uso do site e terceiros |
| `/robots.txt` | Política de indexação conforme o host |
| `/sitemap.xml` | URLs públicas canônicas |
| Rotas não encontradas | Resposta 404 com navegação de retorno |

`src/data` concentra dados públicos; layouts concentram o documento e metadados; componentes compartilham estruturas de interface. Endpoints de robots e sitemap utilizam o domínio oficial. Previews devem permanecer fora da indexação, sem alterar o canonical de produção.

## Assets, fontes e desempenho

A preparação de imagens acontece no build. Imagens do site devem ter dimensões explícitas, formatos eficientes e tamanhos adequados ao uso. O retrato ou imagem visível inicialmente recebe prioridade quando for o elemento de LCP; imagens fora da primeira tela podem usar carregamento tardio. Fontes devem ser servidas localmente, com poucos pesos e fallback adequado.

O adaptador usa `imageService: 'passthrough'`: não depende de transformação de imagens durante a requisição nem provisiona Cloudflare Images. `session: false` desabilita sessões e evita o driver de armazenamento padrão em uma aplicação sem login. A opção foi introduzida no [Astro 7.2](https://astro.build/blog/astro-720/).

Assets com hash podem receber cache longo e imutável; arquivos públicos com nome estável precisam de política que permita atualização. A estratégia de HTML deve ser explícita no middleware, sem confundir um cabeçalho de cache com uma comprovação de hit no edge. Medidas adicionais de cache só se justificam após observar o comportamento publicado.

Não foram adicionados React, gerenciador de estado, biblioteca de animação, formulários, analytics, Turnstile, KV, R2 ou D1. A arquitetura admite essas integrações quando houver um requisito concreto.

## Vídeo do Hero

Em 2026-09-17, um vídeo de referência (`.img/Marble_face_loop_animation_1080p_20260916225641.mp4`, 1080p, 10s, ~11,8MB) substituiu a imagem estática do emblema no Hero, dentro da mesma moldura circular dourada que já existia. `scripts/prepare-assets.mjs` usa `ffmpeg-static` para recodificar o clipe: remove o áudio (o vídeo é decorativo e sempre mudo), reduz a largura para 1600px e recomprime em H.264/CRF 28, chegando a ~1,7MB sem perda perceptível — o WebM/VP9 testado no mesmo ajuste ficou maior, então não foi adotado. O primeiro frame vira o pôster (`public/images/hero-poster.jpg`), exibido enquanto o vídeo carrega e usado como estado final para quem prefere menos movimento.

O elemento `<video>` é `muted`, `loop`, `playsinline` e carrega sem o atributo `autoplay` no HTML; um script no fim da página confere `prefers-reduced-motion` no cliente antes de iniciar a reprodução, e só chama `.play()` quando o visitante não pediu movimento reduzido. Isso evita um `<video autoplay>` incondicional, que ignoraria essa preferência de acessibilidade. O vídeo é `aria-hidden`, já que é puramente decorativo — o conteúdo textual ao redor já comunica a mensagem do Hero.

## Segurança, acessibilidade e SEO

Respostas SSR aplicam headers no middleware. `public/_headers` cobre assets estáticos e não deve ser considerado proteção das respostas geradas pelo Worker. CSP restringe recursos; sua validação inclui build e preview. Scripts, JSON-LD, fontes e estilos precisam respeitar a política efetivamente emitida. A [referência de CSP do Astro](https://docs.astro.build/en/reference/configuration-reference/#securitycsp) descreve a geração de hashes e as limitações no modo de desenvolvimento.

Além de HTTPS no domínio, a política de resposta inclui proteção contra interpretação indevida de MIME, controle de referrer e de recursos do navegador. Secrets futuros pertencem ao ambiente Cloudflare, nunca a módulos públicos ou ao Git.

HTML semântico, foco visível, navegação por teclado, textos alternativos e respeito a `prefers-reduced-motion` orientam a interface. A revisão visual inclui viewport estreito para detectar overflow, sobreposição e texto cortado. Dimensões de mídia e tipografia previsível ajudam a limitar mudanças de layout.

Metadados são específicos por página, com canonical no domínio oficial, Open Graph, Twitter Cards, sitemap e robots. Dados estruturados descrevem apenas informações verificáveis do profissional e do site; não afirmam credenciais ou resultados clínicos não fornecidos.

## Entrega pelo GitHub

O fluxo é **desenvolvimento → GitHub → Workers Builds → Worker**. `main` é produção. Branches e pull requests recebem validação e podem gerar versões de preview. `scripts/deploy.mjs` protege a publicação de produção por contexto de CI/Git. O build instala pelo lockfile e executa check, lint e compilação antes de publicar.

Workers Builds conecta diretamente o repositório. A configuração inicial de conta, permissões, branch e comandos acontece no painel; mudanças de aplicação seguem pelo Git. Previews usam upload de versão sem promoção para produção. Os passos operacionais estão no [README](../README.md), baseados na [configuração oficial de Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

O rollback normal é um revert versionado, validado e publicado pelo mesmo pipeline. Não se usa edição direta do Worker como mecanismo de atualização do site.

## Domínio e publicação pendente

`https://caliendopsi.com.br` é a origem canônica pretendida. A associação só será ativada posteriormente, com a zona Cloudflare ativa e o site revisado. A rota de Custom Domain deve ser versionada em `wrangler.jsonc`. Cloudflare administra o DNS correspondente e o certificado do hostname. [Documentação de Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

Um repositório remoto e uma conta autenticada não foram fornecidos nesta etapa. Build local, configuração de deploy e documentação não equivalem a uma publicação externa. Não há criação de DNS, Worker ou repositório remoto implícita na instalação das dependências.

## Critérios de validação

A entrega técnica exige instalação reproduzível, Astro Check, lint e build sem falhas. O smoke test verifica rotas, status, SSR, metadados e referências de assets contra um servidor local. A revisão no navegador cobre desktop e mobile, navegação, teclado, console e solicitações de rede. O preview precisa executar no runtime Cloudflare.

Lighthouse local fornece um sinal de laboratório, condicionado ao ambiente de execução. Core Web Vitals de campo dependem de usuários e tráfego após a publicação. O relatório final de validação deve distinguir checks executados, verificações visuais e integrações externas ainda pendentes.
