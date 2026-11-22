import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Formulário /mapeamento-casa (22/11/2026, pedido do Humberto): o mapeamento de uma casa noturna antes de fechar
// sociedade (noite semanal "É o Trap, é o Rap, é o Funk"). As respostas vão para o painel da BrandSquad pela rota
// pública /api/leads (isca CADASTRO-MAPEAMENTO, que fica fora da captação), igual ao formulário de /produtores.
const LEADS_URL = 'https://www.brandsquad.com.br/api/leads';

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const d = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!d) return NextResponse.json({ ok: false, error: 'Dados inválidos.' }, { status: 400 });
  if (texto(d.site_url, 200)) return NextResponse.json({ ok: true });
  const nome = texto(d.quem, 120);
  const whatsapp = texto(d.whatsapp, 30);
  const respostas = texto(d.texto, 19000);
  if (nome.length < 2) return NextResponse.json({ ok: false, error: 'Põe o seu nome no começo.' }, { status: 400 });
  if (whatsapp.replace(/\D/g, '').length < 10) return NextResponse.json({ ok: false, error: 'Põe o seu WhatsApp com DDD no começo.' }, { status: 400 });
  try {
    const res = await fetch(LEADS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip },
      body: JSON.stringify({
        name: nome,
        phone: whatsapp,
        company: texto(d.casa, 160) || 'Mapeamento de casa',
        niche: 'evento',
        source: 'site_form',
        isca: 'CADASTRO-MAPEAMENTO',
        page: 'royals /mapeamento-casa',
        message: respostas,
        consent: true,
      }),
    });
    const json = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean; error?: string };
    if (!json.ok) return NextResponse.json({ ok: false, error: json.error || 'Não deu para enviar agora.' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[mapeamento] falha ao enviar', e);
    return NextResponse.json({ ok: false, error: 'Não deu para enviar agora. Copie as respostas e mande no WhatsApp.' }, { status: 503 });
  }
}
