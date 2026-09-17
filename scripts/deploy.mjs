import { spawnSync } from 'node:child_process';

const isCi = process.env.CI === 'true' || process.env.WORKERS_CI === '1' || process.env.WORKERS_CI === 'true';
const forced = process.argv.includes('--force') || process.env.ALLOW_LOCAL_DEPLOY === '1';

if (!isCi && !forced) {
  console.error(
    [
      'Deploy de produção bloqueado: este comando só deve rodar no pipeline do Workers Builds.',
      'O contexto atual não expõe as variáveis de CI (CI/WORKERS_CI) fornecidas pela Cloudflare.',
      '',
      'Se este for mesmo um deploy manual intencional, execute novamente com --force',
      'ou defina ALLOW_LOCAL_DEPLOY=1, sabendo que isso publica diretamente em produção.',
    ].join('\n'),
  );
  process.exit(1);
}

const branch = process.env.WORKERS_CI_BRANCH;
if (isCi && branch && branch !== 'main') {
  console.error(`Deploy de produção bloqueado: branch atual é "${branch}", esperado "main".`);
  process.exit(1);
}

const result = spawnSync('npx', ['wrangler', 'deploy'], { stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(result.status ?? 1);
