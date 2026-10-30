'use client';
import { useState } from 'react';
import { linkWhatsApp, WHATSAPP_BOOKING } from '@/lib/site';

const FORMATOS = ['Warm-up', 'Set principal', 'Sunset', 'Closing', 'Ainda não sei'];

/** Pedido de data do LUCCO: monta a mensagem e abre o WhatsApp de booking da Royals. Enquanto o número não estiver em
 *  src/lib/site.ts (WHATSAPP_BOOKING), copia a mensagem e abre o direct do Instagram da Royals. */
export function FormContratar({ instagramRoyals }: { instagramRoyals: string }) {
  const [copiado, setCopiado] = useState(false);

  const envia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? '').trim();
    const data = v('data') ? new Date(`${v('data')}T12:00:00`).toLocaleDateString('pt-BR') : '';
    const linhas = [
      'Olá, Royals. Quero contratar o DJ LUCCO.',
      '',
      `Nome: ${v('nome')}`,
      v('empresa') ? `Casa / evento: ${v('empresa')}` : null,
      `Data: ${data}${v('horario') ? ` · ${v('horario')}` : ''}`,
      `Cidade: ${v('cidade')}`,
      `Formato: ${v('formato')}`,
      v('obs') ? `Detalhes: ${v('obs')}` : null,
      '',
      '(enviado pela página do LUCCO no site da Royals)',
    ].filter((l) => l !== null);
    const msg = linhas.join('\n');
    if (WHATSAPP_BOOKING) { window.open(linkWhatsApp(WHATSAPP_BOOKING, msg), '_blank', 'noopener'); return; }
    try { await navigator.clipboard.writeText(msg); setCopiado(true); } catch {}
    window.open(`https://ig.me/m/${instagramRoyals}`, '_blank', 'noopener');
  };

  return (
    <form className="form" onSubmit={envia}>
      <label className="form__campo"><span>Seu nome</span><input name="nome" required autoComplete="name" /></label>
      <label className="form__campo"><span>Casa ou evento</span><input name="empresa" autoComplete="organization" /></label>
      <label className="form__campo form__campo--meio"><span>Data</span><input name="data" type="date" required /></label>
      <label className="form__campo form__campo--meio"><span>Horário do set</span><input name="horario" placeholder="ex.: 23h às 01h" /></label>
      <label className="form__campo"><span>Cidade</span><input name="cidade" required autoComplete="address-level2" /></label>
      <fieldset className="form__formatos">
        <legend>Formato</legend>
        {FORMATOS.map((f, i) => (
          <label key={f} className="form__chip"><input type="radio" name="formato" value={f} defaultChecked={i === 1} /><span>{f}</span></label>
        ))}
      </fieldset>
      <label className="form__campo"><span>Detalhes (opcional)</span><textarea name="obs" rows={3} placeholder="Tipo de evento, público, estrutura" /></label>
      <button type="submit" className="bt bt--cheio form__enviar">
        {WHATSAPP_BOOKING ? 'Enviar pelo WhatsApp' : 'Enviar pelo Instagram'}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
      </button>
      {!WHATSAPP_BOOKING && <p className="form__nota" aria-live="polite">{copiado ? 'Mensagem copiada: é só colar no direct da Royals.' : 'A mensagem é copiada e o direct da Royals abre em seguida.'}</p>}
    </form>
  );
}
