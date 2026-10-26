'use client';
import { useState } from 'react';

// O formulário manda para /api/produtores (deste site), que repassa o produtor ao painel de leads da BrandSquad.
const PUBLICOS = ['Até 300 pessoas', '300 a 800', '800 a 2.000', '2.000 a 5.000', 'Mais de 5.000'];
const ESTILOS = ['Trap', 'Funk', 'Trap e funk', 'Pagode / samba', 'Eletrônica', 'Outro'];

type Estado = { tipo: 'form' } | { tipo: 'enviando' } | { tipo: 'erro'; msg: string } | { tipo: 'ok' };

export function Formulario() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'form' });

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => String(fd.get(k) ?? '').trim();
    setEstado({ tipo: 'enviando' });
    try {
      const res = await fetch('/api/produtores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: v('nome'), whatsapp: v('whatsapp'), instagram: v('instagram'), evento: v('evento'), data: v('data'),
          publico: v('publico'), estilo: v('estilo'), obs: v('obs'), consent: fd.get('consent') === 'on', site_url: v('site_url'),
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error || 'Não deu para enviar agora.');
      setEstado({ tipo: 'ok' });
    } catch (err) {
      setEstado({ tipo: 'erro', msg: err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'Não deu para enviar agora. Tente de novo ou chame a Royals no direct.' });
    }
  }

  if (estado.tipo === 'ok')
    return (
      <div className="prod-form prod-form--ok" role="status">
        <span className="rotulo-texto">Recebido</span>
        <p className="h3">A equipe da parceria vai te chamar no WhatsApp.</p>
        <p className="lead">Enquanto isso, separe o que você já tem do evento: data, local, atração e o público que espera.</p>
      </div>
    );

  return (
    <form className="prod-form" onSubmit={enviar}>
      <div className="prod-form__campos">
        <label className="prod-campo"><span>Seu nome</span><input name="nome" required minLength={2} autoComplete="name" /></label>
        <label className="prod-campo"><span>WhatsApp</span><input name="whatsapp" type="tel" required minLength={8} placeholder="(92) 9 0000-0000" autoComplete="tel" /></label>
        <label className="prod-campo"><span>Instagram</span><input name="instagram" placeholder="@seuevento" /></label>
        <label className="prod-campo"><span>Nome do evento</span><input name="evento" /></label>
        <label className="prod-campo"><span>Data prevista</span><input name="data" placeholder="mês ou data" /></label>
        <label className="prod-campo">
          <span>Público esperado</span>
          <select name="publico" defaultValue=""><option value="" disabled>Escolha</option>{PUBLICOS.map((p) => <option key={p}>{p}</option>)}</select>
        </label>
        <label className="prod-campo">
          <span>Estilo</span>
          <select name="estilo" defaultValue=""><option value="" disabled>Escolha</option>{ESTILOS.map((p) => <option key={p}>{p}</option>)}</select>
        </label>
        <label className="prod-campo prod-campo--largo"><span>Conta mais (opcional)</span><input name="obs" maxLength={300} placeholder="Atração, local, o que já está fechado" /></label>
      </div>
      {/* campo-isca para robôs */}
      <input name="site_url" tabIndex={-1} autoComplete="off" className="so-leitor" aria-hidden="true" />
      <label className="prod-termos">
        <input name="consent" type="checkbox" required />
        <span>Concordo em ser contatado pela Royals e pelas parceiras da oferta (BrandSquad e Royals Tickets), conforme a <a href="/privacidade">política de privacidade</a>.</span>
      </label>
      {estado.tipo === 'erro' && <p className="prod-form__erro" role="alert">{estado.msg}</p>}
      <button className="botao botao--lg" type="submit" disabled={estado.tipo === 'enviando'}>
        {estado.tipo === 'enviando' ? 'Enviando' : 'Quero fazer meu evento com a Royals'}
        <span className="seta" aria-hidden="true">→</span>
      </button>
    </form>
  );
}
