// Entrega um comprovante guardado no banco. Só foto (sem SVG) ou PDF entram no upload; aqui ainda travamos o conteúdo.
export function servirComprovante(c: { nome: string; mime: string; dados: string }) {
  const nome = c.nome.replace(/[^\w.\- ]+/g, '_');
  const pdf = c.mime === 'application/pdf';
  return new Response(Buffer.from(c.dados, 'base64'), {
    headers: {
      'Content-Type': c.mime,
      'Content-Disposition': `inline; filename="${nome}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
      'X-Content-Type-Options': 'nosniff',
      ...(pdf ? {} : { 'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox" }),
    },
  });
}
