'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Grupo } from '../cadastro-artista/FormularioArtista';

// Mapeamento de casa noturna (22/11/2026): o Humberto preenche na visita. Mesmo molde do cadastro de artista (rascunho só
// no navegador, opções separadas por " · "), com duas coisas a mais: a conta da noite ao vivo (com os números de uma
// noite cheia e o 50/50) e o botão que envia tudo para o painel da BrandSquad (/api/mapeamento).
const SEP = ' · ';
const num = (s: string | undefined) => Number(String(s ?? '').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
const rs = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function FormularioMapeamento({ grupos }: { grupos: Grupo[] }) {
  const [resp, setResp] = useState<Record<string, string>>({});
  const [quem, setQuem] = useState('');
  const [zap, setZap] = useState('');
  const [estado, setEstado] = useState<'livre' | 'enviando' | 'feito'>('livre');
  const [erro, setErro] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [lido, setLido] = useState(false);
  const guarda = 'royals-mapeamento-casa';

  useEffect(() => {
    try {
      const s = window.localStorage.getItem(guarda);
      if (s) {
        const d = JSON.parse(s) as { resp?: Record<string, string>; quem?: string; zap?: string };
        // eslint-disable-next-line react-hooks/set-state-in-effect -- rascunho só existe no navegador
        setResp(d.resp ?? {}); setQuem(d.quem ?? ''); setZap(d.zap ?? '');
      }
    } catch {}
    setLido(true);
  }, []);
  useEffect(() => {
    if (!lido) return;
    try { window.localStorage.setItem(guarda, JSON.stringify({ resp, quem, zap })); } catch {}
  }, [lido, resp, quem, zap]);

  // a conta da noite, com os números de uma noite cheia (bloco "Os números")
  const conta = useMemo(() => {
    const pagantes = num(resp['n-pagantes']), ingresso = num(resp['n-ingresso']), bar = num(resp['n-bar']);
    const custoBebidaPct = num(resp['n-custo-bebida']) || 35, meusCustos = num(resp['n-meus-custos']);
    const porta = pagantes * ingresso;
    const doLucro = (resp['bar-base'] ?? '').includes('lucro');
    const barBase = doLucro ? bar * (1 - custoBebidaPct / 100) : bar;
    const minha = porta / 2 + barBase / 2;
    return { porta, bar, barBase, minha, sobra: minha - meusCustos, doLucro, custoBebidaPct, meusCustos, ok: porta > 0 || bar > 0 };
  }, [resp]);

  const total = grupos.reduce((n, g) => n + g.perguntas.length, 0);
  const feitas = grupos.reduce((n, g) => n + g.perguntas.filter((p) => (resp[p.id] ?? '').trim()).length, 0);
  const texto = useMemo(() => {
    const l = ['MAPEAMENTO DA CASA · É o Trap, é o Rap, é o Funk · Royals', quem.trim() ? `Preenchido por: ${quem.trim()}${zap.trim() ? ` · ${zap.trim()}` : ''}` : '', ''];
    for (const g of grupos) {
      l.push(`— ${g.titulo.toUpperCase()} —`);
      for (const p of g.perguntas) l.push(p.rotulo, `→ ${(resp[p.id] ?? '').trim() || '(sem resposta)'}`, '');
    }
    if (conta.ok) l.push('— A CONTA DA NOITE (estimativa do formulário) —', `Porta: ${rs(conta.porta)} · Bar: ${rs(conta.bar)}${conta.doLucro ? ` (base do lucro: ${rs(conta.barBase)})` : ''}`, `Minha parte (50% + 50%): ${rs(conta.minha)} · Meus custos: ${rs(conta.meusCustos)} · Sobra: ${rs(conta.sobra)}`);
    return l.filter((x, i, a) => !(x === '' && a[i - 1] === '')).join('\n').trim();
  }, [grupos, quem, zap, resp, conta]);

  const muda = (id: string, v: string) => setResp((r) => ({ ...r, [id]: v }));
  const marca = (id: string, op: string) => {
    const atual = (resp[id] ?? '').split(SEP).filter(Boolean);
    muda(id, (atual.includes(op) ? atual.filter((x) => x !== op) : [...atual, op]).join(SEP));
  };

  async function enviar() {
    if (quem.trim().length < 2) { setErro('Põe o seu nome lá no começo.'); return; }
    if (zap.replace(/\D/g, '').length < 10) { setErro('Põe o seu WhatsApp com DDD lá no começo.'); return; }
    setErro(''); setEstado('enviando');
    try {
      const r = await fetch('/api/mapeamento', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quem, whatsapp: zap, casa: resp['casa-nome'] ?? '', texto }) });
      const j = (await r.json().catch(() => ({ ok: false }))) as { ok: boolean; error?: string };
      if (!r.ok || !j.ok) throw new Error(j.error || 'Não deu para enviar agora.');
      setEstado('feito');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Sem conexão. Copie as respostas.');
      setEstado('livre');
    }
  }
  async function copiar() {
    try { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch {}
  }

  return (
    <form className="cad-form" onSubmit={(e) => e.preventDefault()}>
      <div className="cad-progresso" aria-live="polite">
        <span className="rotulo-texto">{feitas} de {total} respondidas</span>
        <span className="cad-progresso__barra"><span style={{ width: `${(feitas / total) * 100}%` }} /></span>
      </div>
      <div className="cad-ja" style={{ listStyle: 'none' }}>
        <label className="cad-campo cad-campo--quem"><span>Seu nome</span><input value={quem} onChange={(e) => setQuem(e.target.value)} autoComplete="name" /></label>
        <label className="cad-campo cad-campo--quem"><span>Seu WhatsApp (com DDD)</span><input value={zap} onChange={(e) => setZap(e.target.value)} inputMode="tel" autoComplete="tel" /></label>
      </div>

      {grupos.map((g, gi) => (
        <fieldset key={g.titulo} className="cad-grupo">
          <legend>
            <span className="cad-grupo__num">{String(gi + 1).padStart(2, '0')}</span>
            <span className="cad-grupo__titulo">{g.titulo}</span>
            {g.pagina && <span className="cad-grupo__pagina">{g.pagina}</span>}
          </legend>
          {g.perguntas.map((p) => (
            <div key={p.id} className="cad-campo">
              <label htmlFor={`m-${p.id}`}>{p.rotulo}</label>
              {p.ajuda && <small>{p.ajuda}</small>}
              {p.tipo === 'opcoes' && p.opcoes ? (
                <div className="cad-opcoes" role="group" aria-label={p.rotulo}>
                  {p.opcoes.map((op) => {
                    const on = (resp[p.id] ?? '').split(SEP).includes(op);
                    return <button type="button" key={op} className={`cad-opcao${on ? ' cad-opcao--on' : ''}`} aria-pressed={on} onClick={() => marca(p.id, op)}>{op}</button>;
                  })}
                </div>
              ) : p.tipo === 'longo' ? (
                <textarea id={`m-${p.id}`} rows={3} value={resp[p.id] ?? ''} onChange={(e) => muda(p.id, e.target.value)} />
              ) : (
                <input id={`m-${p.id}`} value={resp[p.id] ?? ''} onChange={(e) => muda(p.id, e.target.value)} />
              )}
            </div>
          ))}
          {g.titulo === 'Os números de uma noite cheia' && conta.ok && (
            <div className="cad-ja" style={{ listStyle: 'none' }}>
              <span className="rotulo-texto">A conta da noite (ao vivo)</span>
              <p style={{ margin: 0 }}>Porta: <b>{rs(conta.porta)}</b> · Bar: <b>{rs(conta.bar)}</b>{conta.doLucro ? <> · base do lucro do bar ({100 - conta.custoBebidaPct}%): <b>{rs(conta.barBase)}</b></> : null}</p>
              <p style={{ margin: 0 }}>Sua parte (50% da porta + 50% do bar): <b>{rs(conta.minha)}</b></p>
              <p style={{ margin: 0 }}>Menos os seus custos ({rs(conta.meusCustos)}): sobra <b>{rs(conta.sobra)}</b> por noite</p>
            </div>
          )}
        </fieldset>
      ))}

      <div className="cad-envio">
        {estado === 'feito' ? (
          <p className="h4">Enviado ✓ A Sexta-feira já recebeu e vai bater a conta com você.</p>
        ) : (
          <>
            <p className="h4">Terminou a visita? Envie pra fazer a conta.</p>
            <div className="cad-envio__botoes">
              <button type="button" className="botao botao--lg" onClick={enviar} disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Enviar pra Sexta-feira'} <span className="seta" aria-hidden="true">→</span></button>
              <button type="button" className="botao botao--lg botao--secundario" onClick={copiar}>{copiado ? 'Copiado' : 'Copiar respostas'}</button>
            </div>
            {erro && <p className="cad-envio__nota" style={{ color: 'var(--text-accent)' }}>{erro}</p>}
          </>
        )}
        <p className="cad-envio__nota">O rascunho fica salvo neste aparelho enquanto você preenche: dá pra parar e voltar depois.</p>
      </div>
    </form>
  );
}
