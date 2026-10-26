import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Formulário da /produtores: repassa o produtor para o painel de leads da BrandSquad (parceira da oferta), pela rota
// pública /api/leads dela. De servidor para servidor não há CORS, então nada muda na configuração da BrandSquad.
// O lead entra com isca PRODUTOR e o time é avisado por e-mail pela própria BrandSquad.
const LEADS_URL = 'https://www.brandsquad.com.br/api/leads';

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const tentativas = new Map<string, { n: number; fim: number }>();
function limitado(ip: string) {
  const agora = Date.now();
  const t = tentativas.get(ip);
  if (!t || t.fim < agora) {
    tentativas.set(ip, { n: 1, fim: agora + 60_000 });
    return false;
  }
  return ++t.n > 5;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  if (limitado(ip)) return NextResponse.json({ ok: false, error: 'Muitas tentativas. Tente em um minuto.' }, { status: 429 });
  const d = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!d) return NextResponse.json({ ok: false, error: 'Dados inválidos.' }, { status: 400 });
  // campo-isca: robô preencheu, responde "ok" e não grava
  if (texto(d.site_url, 200)) return NextResponse.json({ ok: true });
  const nome = texto(d.nome, 120);
  const whatsapp = texto(d.whatsapp, 30);
  if (nome.length < 2) return NextResponse.json({ ok: false, error: 'Informe seu nome.' }, { status: 400 });
  if (whatsapp.replace(/\D/g, '').length < 8) return NextResponse.json({ ok: false, error: 'Informe um WhatsApp válido.' }, { status: 400 });
  if (d.consent !== true) return NextResponse.json({ ok: false, error: 'É preciso concordar com o contato.' }, { status: 400 });

  const evento = texto(d.evento, 160);
  const detalhes = [
    'Parceria Royals (produtor)',
    `Evento: ${evento || '-'}`,
    `Data prevista: ${texto(d.data, 60) || '-'}`,
    `Público: ${texto(d.publico, 40) || '-'}`,
    `Estilo: ${texto(d.estilo, 40) || '-'}`,
    texto(d.obs, 300) && `Obs.: ${texto(d.obs, 300)}`,
  ].filter(Boolean).join(' · ');

  try {
    const res = await fetch(LEADS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip },
      body: JSON.stringify({
        name: nome,
        phone: whatsapp,
        instagram: texto(d.instagram, 80) || undefined,
        company: evento || undefined,
        niche: 'evento',
        source: 'site_form',
        isca: 'PRODUTOR',
        page: 'royals /produtores',
        message: detalhes,
        consent: true,
      }),
    });
    const json = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean; error?: string };
    if (!json.ok) return NextResponse.json({ ok: false, error: json.error || 'Não deu para enviar agora.' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[produtores] falha ao repassar o lead', e);
    return NextResponse.json({ ok: false, error: 'Não deu para enviar agora. Tente de novo ou chame a Royals no direct.' }, { status: 503 });
  }
}
