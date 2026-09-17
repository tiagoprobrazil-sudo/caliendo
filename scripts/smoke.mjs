const baseUrl = process.env.SMOKE_URL ?? process.argv[2] ?? 'http://127.0.0.1:4321';

const checks = [
  {
    name: 'GET / retorna 200 com conteúdo SSR e metadados',
    run: async () => {
      const res = await fetch(baseUrl + '/');
      const body = await res.text();
      assert(res.status === 200, `status esperado 200, recebido ${res.status}`);
      assert(body.includes('Eduardo Caliendo'), 'conteúdo principal ausente no HTML inicial');
      assert(body.includes('<link rel="canonical"'), 'canonical ausente');
      assert(body.includes('name="description"'), 'meta description ausente');
    },
  },
  {
    name: 'GET /privacidade/ retorna 200',
    run: async () => {
      const res = await fetch(baseUrl + '/privacidade/');
      const body = await res.text();
      assert(res.status === 200, `status esperado 200, recebido ${res.status}`);
      assert(body.includes('Privacidade'), 'conteúdo da página de privacidade ausente');
    },
  },
  {
    name: 'GET /rota-inexistente retorna 404',
    run: async () => {
      const res = await fetch(baseUrl + '/rota-inexistente-' + Date.now());
      assert(res.status === 404, `status esperado 404, recebido ${res.status}`);
    },
  },
  {
    name: 'GET /robots.txt retorna 200 texto',
    run: async () => {
      const res = await fetch(baseUrl + '/robots.txt');
      const body = await res.text();
      assert(res.status === 200, `status esperado 200, recebido ${res.status}`);
      assert(body.includes('User-agent'), 'conteúdo de robots.txt inesperado');
    },
  },
  {
    name: 'GET /sitemap.xml retorna 200 XML',
    run: async () => {
      const res = await fetch(baseUrl + '/sitemap.xml');
      const body = await res.text();
      assert(res.status === 200, `status esperado 200, recebido ${res.status}`);
      assert(body.includes('<urlset'), 'conteúdo de sitemap.xml inesperado');
    },
  },
  {
    name: 'GET /images/social-card.jpg retorna 200',
    run: async () => {
      const res = await fetch(baseUrl + '/images/social-card.jpg');
      assert(res.status === 200, `status esperado 200, recebido ${res.status}`);
    },
  },
  {
    name: 'GET /favicon.png retorna 200',
    run: async () => {
      const res = await fetch(baseUrl + '/favicon.png');
      assert(res.status === 200, `status esperado 200, recebido ${res.status}`);
    },
  },
  {
    name: 'GET /videos/hero-marble.mp4 retorna 200',
    run: async () => {
      const res = await fetch(baseUrl + '/videos/hero-marble.mp4');
      assert(res.status === 200, `status esperado 200, recebido ${res.status}`);
      assert(
        (res.headers.get('content-type') ?? '').includes('video/mp4'),
        'content-type inesperado para o vídeo do hero',
      );
    },
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

let failures = 0;
console.log(`Smoke test contra ${baseUrl}`);
for (const check of checks) {
  try {
    await check.run();
    console.log(`  OK  ${check.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FALHA  ${check.name}`);
    console.error(`       ${error.message}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} verificação(ões) falharam.`);
  process.exit(1);
}

console.log('\nTodas as verificações passaram.');
