// Portão do /financeiro: sem sessão válida, nada da área interna é renderizado (vai para o login).
// As páginas e as Server Actions conferem o admin de novo no banco (exigirAdmin); isto é a primeira barreira.
import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE, lerToken } from '@/lib/financeiro/sessao';

const LIVRES = [/^\/financeiro\/entrar\/?$/, /^\/financeiro\/convite\//, /^\/financeiro\/opengraph-image/];

export function proxy(req: NextRequest) {
  const caminho = req.nextUrl.pathname;
  if (LIVRES.some((r) => r.test(caminho))) return NextResponse.next();
  if (lerToken(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  if (caminho.startsWith('/financeiro/comprovante/')) return new NextResponse('Não autorizado', { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = '/financeiro/entrar';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/financeiro', '/financeiro/:caminho*'] };
