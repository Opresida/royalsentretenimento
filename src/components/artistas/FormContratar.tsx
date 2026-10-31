'use client';
import { useState } from 'react';
import { linkWhatsApp, WHATSAPP_BOOKING } from '@/lib/site';

/** Pedido de data de um artista do casting: monta a mensagem e abre o WhatsApp de booking da Royals. Sem número em
 *  src/lib/site.ts (WHATSAPP_BOOKING), copia a mensagem e abre o direct do Instagram da Royals.
 *  `classe` é o prefixo BEM do visual de cada página (o LUCCO usa "form"; cada artista tem o seu). */
export function FormContratar({ artista, pagina, formatos, formatoPadrao = 0, instagramRoyals, classe = 'form', botao, rotulos }: {
  artista: string; pagina: string; formatos: string[]; formatoPadrao?: number; instagramRoyals: string; classe?: string;
  botao?: { whatsapp: string; instagram: string };
  rotulos?: Partial<Record<'nome' | 'empresa' | 'data' | 'horario' | 'cidade' | 'formato' | 'obs', string>>;
}) {
  const [copiado, setCopiado] = useState(false);
  const r = { nome: 'Seu nome', empresa: 'Casa ou evento', data: 'Data', horario: 'Horário do set', cidade: 'Cidade', formato: 'Formato', obs: 'Detalhes (opcional)', ...rotulos };
  const c = (s = '') => `${classe}${s}`;

  const envia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? '').trim();
    const data = v('data') ? new Date(`${v('data')}T12:00:00`).toLocaleDateString('pt-BR') : '';
    const linhas = [
      `Olá, Royals. Quero contratar o ${artista}.`,
      '',
      `Nome: ${v('nome')}`,
      v('empresa') ? `Casa / evento: ${v('empresa')}` : null,
      `Data: ${data}${v('horario') ? ` · ${v('horario')}` : ''}`,
      `Cidade: ${v('cidade')}`,
      `Formato: ${v('formato')}`,
      v('obs') ? `Detalhes: ${v('obs')}` : null,
      '',
      `(enviado pela página ${pagina} no site da Royals)`,
    ].filter((l) => l !== null);
    const msg = linhas.join('\n');
    if (WHATSAPP_BOOKING) { window.open(linkWhatsApp(WHATSAPP_BOOKING, msg), '_blank', 'noopener'); return; }
    try { await navigator.clipboard.writeText(msg); setCopiado(true); } catch {}
    window.open(`https://ig.me/m/${instagramRoyals}`, '_blank', 'noopener');
  };

  return (
    <form className={c()} onSubmit={envia}>
      <label className={c('__campo')}><span>{r.nome}</span><input name="nome" required autoComplete="name" /></label>
      <label className={c('__campo')}><span>{r.empresa}</span><input name="empresa" autoComplete="organization" /></label>
      <label className={`${c('__campo')} ${c('__campo--meio')}`}><span>{r.data}</span><input name="data" type="date" required /></label>
      <label className={`${c('__campo')} ${c('__campo--meio')}`}><span>{r.horario}</span><input name="horario" placeholder="ex.: 23h às 01h" /></label>
      <label className={c('__campo')}><span>{r.cidade}</span><input name="cidade" required autoComplete="address-level2" /></label>
      <fieldset className={c('__formatos')}>
        <legend>{r.formato}</legend>
        {formatos.map((f, i) => (
          <label key={f} className={c('__chip')}><input type="radio" name="formato" value={f} defaultChecked={i === formatoPadrao} /><span>{f}</span></label>
        ))}
      </fieldset>
      <label className={c('__campo')}><span>{r.obs}</span><textarea name="obs" rows={3} placeholder="Tipo de evento, público, estrutura" /></label>
      <button type="submit" className={`bt bt--cheio ${c('__enviar')}`}>
        {WHATSAPP_BOOKING ? (botao?.whatsapp ?? 'Enviar pelo WhatsApp') : (botao?.instagram ?? 'Enviar pelo Instagram')}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
      </button>
      {!WHATSAPP_BOOKING && <p className={c('__nota')} aria-live="polite">{copiado ? 'Mensagem copiada: é só colar no direct da Royals.' : 'A mensagem é copiada e o direct da Royals abre em seguida.'}</p>}
    </form>
  );
}
