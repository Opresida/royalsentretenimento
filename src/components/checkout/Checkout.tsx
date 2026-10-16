'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { DadosCheckout } from '@/data/ingressos';
import { Assinatura } from '@/components/Marca';
import './checkout.css';

// Royals Tickets · checkout de um evento, portado do modelo aprovado (D:\CLIENTES BRANDSQUADS\Royals Tickets\Checkout)
// para o design system do site. Três etapas (ingressos, dados, pagamento) e o resumo fixo ao lado; no celular, o resumo
// desce e uma barra com o total fica presa embaixo.
// Pagamento: será processado pelo Pagar.me (Pix e cartão). Enquanto `vendasAbertas` for false (prévia), o "Pagar" valida
// tudo e abre o aviso de que a venda pelo site abre em breve, com o botão para o canal atual (Igarê).

export type EventoCheckout = { nome: string; logo?: string; parceiros?: { nome: string; logo: string }[]; dataCurta: string; diaSemana: string; abertura?: string; local?: string; cidade: string; cor?: string; sobreCor?: string;
  banner: { desktop: string; tablet: string; celular: string } };

type Metodo = 'pix' | 'cartao';
type Campo = 'nome' | 'email' | 'cpf' | 'celular' | 'cartao' | 'titular' | 'validade' | 'cvv';
type Form = Record<Campo, string> & { parcelas: string; termos: boolean };

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const digitos = (v: string, n: number) => v.replace(/\D/g, '').slice(0, n);
function mascara(k: Campo, v: string) {
  if (k === 'cpf') return digitos(v, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
  if (k === 'celular') { const s = digitos(v, 11); if (s.length <= 2) return s.length ? `(${s}` : ''; if (s.length <= 7) return `(${s.slice(0, 2)}) ${s.slice(2)}`; return `(${s.slice(0, 2)}) ${s.slice(2, s.length - 4)}-${s.slice(-4)}`; }
  if (k === 'cartao') return digitos(v, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
  if (k === 'validade') { const s = digitos(v, 4); return s.length > 2 ? `${s.slice(0, 2)}/${s.slice(2)}` : s; }
  if (k === 'cvv') return digitos(v, 4);
  return v;
}
function cpfValido(v: string) {
  const s = digitos(v, 11);
  if (s.length !== 11 || /^(\d)\1+$/.test(s)) return false;
  const dv = (n: number) => { let t = 0; for (let i = 0; i < n; i++) t += +s[i] * (n + 1 - i); const r = (t * 10) % 11; return r === 10 ? 0 : r; };
  return dv(9) === +s[9] && dv(10) === +s[10];
}
const relogio = (ms: number) => { const t = Math.max(0, Math.floor(ms / 1000)); return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 }; };
const dois = (n: number) => String(n).padStart(2, '0');

export function Checkout({ evento, dados }: { evento: EventoCheckout; dados: DadosCheckout }) {
  const [qtd, setQtd] = useState<Record<string, number>>({});
  const [form, setForm] = useState<Form>({ nome: '', email: '', cpf: '', celular: '', cartao: '', titular: '', validade: '', cvv: '', parcelas: '1', termos: false });
  const [metodo, setMetodo] = useState<Metodo>(dados.pagamento.metodos[0]);
  const [tentou, setTentou] = useState(false);
  const [aviso, setAviso] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => { if (!dados.lote?.terminaEm) return; const t = setInterval(() => setAgora(Date.now()), 1000); return () => clearInterval(t); }, [dados.lote?.terminaEm]);

  const total$ = Object.values(qtd).reduce((a, b) => a + b, 0);
  const linhas: { rotulo: string; valor: number }[] = [];
  let subtotal = 0;
  for (const t of dados.ingressos) for (const [k, rotulo, preco] of [['inteira', 'Inteira', t.preco], ['meia', 'Meia-entrada', t.meia]] as const) {
    const q = qtd[`${t.id}:${k}`] || 0;
    if (q && preco != null) { linhas.push({ rotulo: `${q}× ${t.nome} · ${rotulo}`, valor: q * preco }); subtotal += q * preco; }
  }
  const taxa = Math.round((subtotal * dados.taxaPercent) / 100);
  const total = subtotal + taxa;
  const parcelas = Array.from({ length: dados.pagamento.parcelasMax }, (_, i) => { const n = i + 1; return { v: String(n), l: n === 1 ? `À vista · ${brl(total)}` : `${n}x de ${brl(Math.ceil(total / n))}${n <= dados.pagamento.parcelasSemJuros ? ' sem juros' : ' + juros'}` }; });

  const erros = useMemo(() => {
    const e: Partial<Record<Campo | 'termos' | 'carrinho', string>> = {};
    if (form.nome.trim().split(/\s+/).length < 2) e.nome = 'Informe nome e sobrenome';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) e.email = 'Informe um e-mail válido';
    if (!cpfValido(form.cpf)) e.cpf = 'CPF inválido';
    if (digitos(form.celular, 11).length < 10) e.celular = 'Informe DDD e número';
    if (metodo === 'cartao') {
      if (digitos(form.cartao, 19).length < 15) e.cartao = 'Número incompleto';
      if (form.titular.trim().length < 3) e.titular = 'Informe o nome do cartão';
      const m = form.validade.match(/^(\d{2})\/(\d{2})$/); if (!m || +m[1] < 1 || +m[1] > 12) e.validade = 'Use MM/AA';
      if (form.cvv.length < 3) e.cvv = 'CVV inválido';
    }
    if (!form.termos) e.termos = 'Aceite os termos para continuar';
    if (!total$) e.carrinho = 'Selecione ao menos um ingresso.';
    return e;
  }, [form, metodo, total$]);
  const erro = (k: Campo | 'termos') => (tentou ? erros[k] : undefined);

  const muda = (k: Campo) => (ev: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: mascara(k, ev.target.value) }));
  const passo = (chave: string, d: number, esgotado: boolean) => setQtd((q) => {
    const atual = q[chave] || 0;
    if (d > 0 && (esgotado || total$ >= dados.maxPorPedido)) return q;
    return { ...q, [chave]: Math.max(0, atual + d) };
  });
  const pagar = () => { setTentou(true); if (Object.keys(erros).length) return; setAviso(true); };
  const cta = !total$ ? 'Selecione seus ingressos' : metodo === 'pix' ? `Pagar com Pix · ${brl(total)}` : `Pagar ${brl(total)}`;
  const fim = dados.lote?.terminaEm ? relogio(new Date(dados.lote.terminaEm).getTime() - agora) : null;
  const estilo = evento.cor ? ({ '--event-accent': evento.cor, '--event-on-accent': evento.sobreCor ?? '#050505' } as React.CSSProperties) : undefined;

  return (
    <div className="ck" style={estilo}>
      {!dados.vendasAbertas && (
        <p className="ck-previa">Prévia da Royals Tickets. Valores de referência{dados.referencia ? ` (${dados.referencia})` : ''}: a venda deste evento continua{dados.referencia ? ` na ${dados.referencia}` : ' no canal oficial'}.</p>
      )}
      <header className="ck-topo">
        <Link href="/" aria-label="Royals Tickets, voltar ao site da Royals">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/tickets/royals-tickets-gold.svg" alt="Royals Tickets" width={170} height={61} />
        </Link>
        <span className="ck-seguro"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" /><rect x="5" y="10" width="14" height="10" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>Compra segura</span>
      </header>

      <section className="ck-banner">
        <picture>
          <source media="(min-width: 1024px)" srcSet={evento.banner.desktop} />
          <source media="(min-width: 640px)" srcSet={evento.banner.tablet} />
          <img src={evento.banner.celular} alt="" />
        </picture>
        <div className="ck-banner__texto">
          <div className="ck-selos">
            {dados.lote && <span className="ck-selo ck-selo--cheio">{dados.lote.nome}</span>}
            {dados.classificacao && <span className="ck-selo">{dados.classificacao}</span>}
          </div>
          {evento.logo
            // eslint-disable-next-line @next/next/no-img-element
            ? <h1 className="ck-titulo ck-titulo--logo"><img src={evento.logo} alt={evento.nome} /></h1>
            : <h1 className="ck-titulo">{evento.nome}</h1>}
          <p className="ck-meta"><strong>{evento.diaSemana} · {evento.dataCurta}</strong>{evento.abertura && <span>Abertura {evento.abertura}</span>}<span>{[evento.local, evento.cidade].filter(Boolean).join(' · ')}</span></p>
          <div className="ck-produz"><Assinatura parceiros={evento.parceiros} /></div>
        </div>
      </section>
      {/* no celular a área do texto do banner é curta: quem produz fica logo abaixo dele */}
      <div className="ck-produz-celular"><Assinatura parceiros={evento.parceiros} /></div>

      {dados.lote && fim && (
        <section className="ck-lote">
          <div><span className="ck-rotulo">{dados.lote.nome} termina em</span><p>{dados.lote.proximo ? `Depois, ${dados.lote.proximo} com novo preço` : 'Preço garantido até o fim do lote'}</p></div>
          <div className="ck-relogio">{[[fim.d, 'Dias'], [fim.h, 'Horas'], [fim.m, 'Min'], [fim.s, 'Seg']].map(([v, l]) => <span key={l}><b>{dois(v as number)}</b>{l}</span>)}</div>
          {dados.lote.vendidoPercent != null && <div className="ck-vendido"><span style={{ width: `${dados.lote.vendidoPercent}%` }} /><p>{dados.lote.vendidoPercent}% do {dados.lote.nome} vendido</p></div>}
        </section>
      )}

      <div className="ck-corpo">
        <main className="ck-etapas">
          <section className="ck-etapa">
            <h2><span>01</span>Escolha seus ingressos</h2>
            <div className="ck-ingressos">
              {dados.ingressos.map((t) => {
                const esgotado = !t.disponivel;
                const tem = ['inteira', 'meia'].some((k) => qtd[`${t.id}:${k}`]);
                return (
                  <article key={t.id} className="ck-ingresso" data-esgotado={esgotado} data-ativo={tem}>
                    <header>
                      <div><h3>{t.nome}</h3>{t.descricao && <p>{t.descricao}</p>}</div>
                      <div className="ck-selos">
                        {t.lote && <span className="ck-selo">{t.lote}</span>}
                        {t.ultimos && !esgotado && <span className="ck-selo ck-selo--cheio">Últimos ingressos</span>}
                        {esgotado && <span className="ck-selo ck-selo--mudo">Esgotado</span>}
                      </div>
                    </header>
                    {([['inteira', 'Inteira', t.preco], ['meia', 'Meia-entrada', t.meia]] as const).filter(([, , p]) => p != null).map(([k, rotulo, preco]) => {
                      const chave = `${t.id}:${k}`, q = qtd[chave] || 0;
                      return (
                        <div key={k} className="ck-linha">
                          <div><b>{rotulo}</b><small>+ {brl(Math.round((preco! * dados.taxaPercent) / 100))} de taxa</small></div>
                          <strong>{brl(preco!)}</strong>
                          <div className="ck-passo">
                            <button type="button" aria-label={`Menos ${t.nome} ${rotulo}`} onClick={() => passo(chave, -1, esgotado)} disabled={!q}>−</button>
                            <output aria-live="polite">{q}</output>
                            <button type="button" aria-label={`Mais ${t.nome} ${rotulo}`} onClick={() => passo(chave, 1, esgotado)} disabled={esgotado || total$ >= dados.maxPorPedido}>+</button>
                          </div>
                        </div>
                      );
                    })}
                  </article>
                );
              })}
            </div>
            <p className="ck-nota">{dados.ingressos.some((t) => t.meia != null) ? 'Meia-entrada: apresente na entrada o documento que comprova o direito (Lei 12.933/2013). ' : ''}Limite de {dados.maxPorPedido} ingressos por pedido.</p>
          </section>

          <section className="ck-etapa">
            <h2><span>02</span>Seus dados</h2>
            <div className="ck-campos">
              <Campo rotulo="Nome completo" valor={form.nome} aoMudar={muda('nome')} erro={erro('nome')} placeholder="Como no documento" auto="name" />
              <Campo rotulo="E-mail" valor={form.email} aoMudar={muda('email')} erro={erro('email')} placeholder="voce@email.com" tipo="email" auto="email" />
              <Campo rotulo="CPF" valor={form.cpf} aoMudar={muda('cpf')} erro={erro('cpf')} placeholder="000.000.000-00" modo="numeric" />
              <Campo rotulo="Celular (WhatsApp)" valor={form.celular} aoMudar={muda('celular')} erro={erro('celular')} placeholder="(00) 00000-0000" modo="tel" auto="tel" />
            </div>
            <p className="ck-nota">Os ingressos são nominais e chegam neste e-mail logo após a aprovação do pagamento.</p>
          </section>

          <section className="ck-etapa">
            <h2><span>03</span>Pagamento</h2>
            <div className="ck-metodos" role="radiogroup" aria-label="Forma de pagamento">
              {dados.pagamento.metodos.map((m) => (
                <button key={m} type="button" role="radio" aria-checked={metodo === m} className="ck-metodo" onClick={() => setMetodo(m)}>
                  <b>{m === 'pix' ? 'Pix' : 'Cartão de crédito'}</b><small>{m === 'pix' ? 'Aprovação imediata' : `Até ${dados.pagamento.parcelasMax}x`}</small>
                </button>
              ))}
            </div>
            {metodo === 'pix' ? (
              <div className="ck-caixa"><p>Ao finalizar, você recebe o QR Code e o código copia e cola. Ele vale por {dados.pagamento.pixMinutos} minutos.</p><small>A aprovação é imediata e os ingressos chegam por e-mail em seguida.</small></div>
            ) : (
              <div className="ck-campos">
                <Campo rotulo="Número do cartão" valor={form.cartao} aoMudar={muda('cartao')} erro={erro('cartao')} placeholder="0000 0000 0000 0000" modo="numeric" auto="cc-number" largo />
                <Campo rotulo="Nome impresso no cartão" valor={form.titular} aoMudar={muda('titular')} erro={erro('titular')} placeholder="Como no cartão" auto="cc-name" largo />
                <Campo rotulo="Validade" valor={form.validade} aoMudar={muda('validade')} erro={erro('validade')} placeholder="MM/AA" modo="numeric" auto="cc-exp" />
                <Campo rotulo="CVV" valor={form.cvv} aoMudar={muda('cvv')} erro={erro('cvv')} placeholder="000" modo="numeric" auto="cc-csc" />
                <label className="ck-campo ck-campo--largo"><span>Parcelas</span>
                  <select value={form.parcelas} onChange={(ev) => setForm((f) => ({ ...f, parcelas: ev.target.value }))}>{parcelas.map((p) => <option key={p.v} value={p.v}>{p.l}</option>)}</select>
                </label>
              </div>
            )}
            <p className="ck-nota ck-nota--seguro"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" /><rect x="5" y="10" width="14" height="10" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>Os dados do cartão são criptografados no seu navegador e enviados direto à Pagar.me. A Royals Tickets não armazena o número do cartão.</p>
          </section>

          {dados.depoimentos.length > 0 && (
            <section className="ck-etapa">
              <h2>Quem já comprou</h2>
              <div className="ck-depoimentos">{dados.depoimentos.map((d) => <blockquote key={d.nome + d.texto.slice(0, 12)}><p>“{d.texto}”</p><footer><b>{d.nome}</b><small>Comprou para {d.evento}</small></footer></blockquote>)}</div>
            </section>
          )}
        </main>

        <aside className="ck-lado">
          <div className="ck-resumo">
            <header><span className="ck-rotulo">Resumo</span><small>{evento.diaSemana} · {evento.dataCurta}</small></header>
            {linhas.length ? <ul>{linhas.map((l) => <li key={l.rotulo}><span>{l.rotulo}</span><span>{brl(l.valor)}</span></li>)}</ul> : <p className="ck-vazio">Nenhum ingresso selecionado.</p>}
            <dl><div><dt>Subtotal</dt><dd>{brl(subtotal)}</dd></div><div><dt>Taxa de serviço</dt><dd>{brl(taxa)}</dd></div></dl>
            <div className="ck-total"><span>Total</span><strong>{brl(total)}</strong></div>
            <p className="ck-total-nota">{metodo === 'cartao' && +form.parcelas > 1 ? parcelas[+form.parcelas - 1].l : `Taxa de serviço de ${dados.taxaPercent}% incluída`}</p>
            <label className="ck-termos" data-erro={!!erro('termos')}>
              <input type="checkbox" checked={form.termos} onChange={(ev) => setForm((f) => ({ ...f, termos: ev.target.checked }))} />
              <span>Li e aceito os <Link href="/termos">Termos de compra</Link> e a <Link href="/privacidade">Política de Privacidade</Link>.</span>
            </label>
            <button type="button" className="ck-pagar" data-vazio={!total$} onClick={pagar}>{cta}</button>
            {tentou && Object.keys(erros).length > 0 && <p className="ck-erro-geral" role="alert">{erros.carrinho ?? 'Revise os campos destacados.'}</p>}
          </div>
          <div className="ck-confianca">
            <p><b>Proteção antifraude</b>Todas as transações passam por análise antifraude antes da aprovação.</p>
            <p><b>Pagamento processado por Pagar.me</b>Conexão criptografada (SSL) de ponta a ponta.</p>
            <p className="ck-bandeiras">Pix · Visa · Mastercard · Elo · Amex · Hipercard</p>
          </div>
        </aside>
      </div>

      {total$ > 0 && !aviso && (
        <div className="ck-barra"><div><small>{total$} {total$ === 1 ? 'ingresso' : 'ingressos'}</small><strong>{brl(total)}</strong></div><button type="button" className="ck-pagar" onClick={pagar}>{metodo === 'pix' ? 'Pagar com Pix' : 'Pagar agora'}</button></div>
      )}

      <footer className="ck-rodape">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca/tickets/royals-tickets-gold.svg" alt="Royals Tickets" width={110} height={39} />
        <span>Uma empresa do grupo Royals</span>
        <nav><Link href="/termos">Termos</Link><Link href="/privacidade">Privacidade</Link><Link href="/contato">Ajuda</Link></nav>
      </footer>

      {aviso && (
        <div className="ck-modal" role="dialog" aria-modal="true" aria-labelledby="ck-modal-titulo" onClick={() => setAviso(false)}>
          <div className="ck-modal__caixa" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/marca/tickets/royals-tickets-gold.svg" alt="" width={150} height={54} />
            <h2 id="ck-modal-titulo">A venda pelo site abre em breve</h2>
            <p>Por enquanto, os ingressos de {evento.nome} são vendidos{dados.referencia ? ` na ${dados.referencia}` : ' no canal oficial'}. O seu pedido de {brl(total)} não foi cobrado.</p>
            {dados.linkExterno && <a className="ck-pagar" href={dados.linkExterno} target="_blank" rel="noopener noreferrer">Comprar {dados.referencia ? `na ${dados.referencia}` : 'no canal oficial'} ↗</a>}
            <button type="button" className="ck-voltar" onClick={() => setAviso(false)}>Voltar ao checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Campo({ rotulo, valor, aoMudar, erro, placeholder, tipo = 'text', modo, auto, largo }: { rotulo: string; valor: string; aoMudar: (e: React.ChangeEvent<HTMLInputElement>) => void; erro?: string; placeholder?: string; tipo?: string; modo?: 'numeric' | 'tel'; auto?: string; largo?: boolean }) {
  return (
    <label className={`ck-campo${largo ? ' ck-campo--largo' : ''}`} data-erro={!!erro}>
      <span>{rotulo}</span>
      <input type={tipo} value={valor} onChange={aoMudar} placeholder={placeholder} inputMode={modo} autoComplete={auto} aria-invalid={!!erro} />
      {erro && <small role="alert">{erro}</small>}
    </label>
  );
}
