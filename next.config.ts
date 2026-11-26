import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // PGlite (banco local de desenvolvimento do Financeiro) carrega WASM do disco; não pode ser empacotado.
  serverExternalPackages: ['@electric-sql/pglite'],
  // Financeiro: o comprovante (foto já reduzida no celular ou PDF até 4 MB) vai junto do formulário do lançamento.
  experimental: { serverActions: { bodySizeLimit: '5mb' } },
  // fontes e logo das imagens de compartilhamento (OG) do Financeiro, lidas do disco
  outputFileTracingIncludes: { '/socio/**': ['./assets/**'], '/financeiro/**': ['./assets/**'] },
};

export default nextConfig;
