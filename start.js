/**
 * Arranque paralelo del monorepo Versionly.
 * Uso: node start.js
 *
 * Levanta api/ (NestJS) y app/ (Next.js) en paralelo con output prefijado por proyecto.
 */

const { spawn } = require('child_process');
const path = require('path');

const projects = [
  {
    name: 'api',
    cwd: path.join(__dirname, 'api'),
    cmd: 'npm',
    args: ['run', 'start:dev'],
    color: '\x1b[36m', // cyan
  },
  {
    name: 'app',
    cwd: path.join(__dirname, 'app'),
    cmd: 'npm',
    args: ['run', 'dev'],
    color: '\x1b[35m', // magenta
  },
];

const reset = '\x1b[0m';

function prefix(name, color) {
  return `${color}[${name}]${reset} `;
}

const processes = projects.map(({ name, cwd, cmd, args, color }) => {
  const proc = spawn(cmd, args, {
    cwd,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  proc.stdout.on('data', (data) => {
    data.toString().split('\n').filter(Boolean).forEach((line) => {
      process.stdout.write(prefix(name, color) + line + '\n');
    });
  });

  proc.stderr.on('data', (data) => {
    data.toString().split('\n').filter(Boolean).forEach((line) => {
      process.stderr.write(prefix(name, color) + line + '\n');
    });
  });

  proc.on('close', (code) => {
    console.log(`${prefix(name, color)}proceso terminó con código ${code}`);
  });

  return proc;
});

process.on('SIGINT', () => {
  console.log('\nDeteniendo todos los procesos...');
  processes.forEach((p) => p.kill('SIGINT'));
  process.exit(0);
});

console.log('\x1b[32m[versionly]\x1b[0m Monorepo iniciando: api (NestJS) + app (Next.js)\n');
