'use client';
import { useEffect, useMemo, useState } from 'react';

// Cadastro de artista (presskit): o produtor preenche as informações que faltam e manda as respostas para a Royals.
// Nada é gravado no servidor: o rascunho fica só no navegador de quem preenche e as respostas saem pelo WhatsApp, por
// cópia ou num arquivo .txt. As perguntas vêm de cada página (ex.: /cadastro-artista/lucco).

export type Pergunta = { id: string; rotulo: string; ajuda?: string; tipo?: 'texto' | 'longo' | 'opcoes'; opcoes?: string[] };
export type Grupo = { titulo: string; pagina?: string; perguntas: Pergunta[] };

const separador = '\n';

export function FormularioArtista({ artista, chave, grupos }: { artista: string; chave: string; grupos: Grupo[] }) {
  const [resp, setResp] = useState<Record<string, string>>({});
  const [quem, setQuem] = useState('');
  const [copiado, setCopiado] = useState(false);
  const armazenamento = `royals-cadastro-${chave}`;

  // rascunho no navegador (se o navegador não deixar guardar, o formulário funciona do mesmo jeito)
  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(armazenamento);
      if (salvo) {
        const d = JSON.parse(salvo) as { resp?: Record<string, string>; quem?: string };
        setResp(d.resp ?? {});
        setQuem(d.quem ?? '');
      }
    } catch {}
  }, [armazenamento]);
  useEffect(() => {
    try { window.localStorage.setItem(armazenamento, JSON.stringify({ resp, quem })); } catch {}
  }, [armazenamento, resp, quem]);

  const total = grupos.reduce((n, g) => n + g.perguntas.length, 0);
  const feitas = grupos.reduce((n, g) => n + g.perguntas.filter((p) => (resp[p.id] ?? '').trim()).length, 0);

  const texto = useMemo(() => {
    const linhas = [`CADASTRO DE ARTISTA · ${artista.toUpperCase()} · Royals Entretenimento`, quem.trim() ? `Preenchido por: ${quem.trim()}` : '', ''];
    for (const g of grupos) {
      linhas.push(`— ${g.titulo.toUpperCase()} —`);
      for (const p of g.perguntas) linhas.push(`${p.rotulo}`, `→ ${(resp[p.id] ?? '').trim() || '(sem resposta)'}`, '');
    }
    return linhas.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join(separador).trim();
  }, [artista, grupos, quem, resp]);

  const muda = (id: string, v: string) => setResp((r) => ({ ...r, [id]: v }));
  const marca = (id: string, op: string) => {
    const atual = (resp[id] ?? '').split(', ').filter(Boolean);
    muda(id, (atual.includes(op) ? atual.filter((x) => x !== op) : [...atual, op]).join(', '));
  };

  async function copiar() {
    try { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch {}
  }
  function baixar() {
    const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `cadastro-${chave}.txt`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <form className="cad-form" onSubmit={(e) => e.preventDefault()}>
      <div className="cad-progresso" aria-live="polite">
        <span className="rotulo-texto">{feitas} de {total} respondidas</span>
        <span className="cad-progresso__barra"><span style={{ width: `${(feitas / total) * 100}%` }} /></span>
      </div>

      <label className="cad-campo cad-campo--quem">
        <span>Seu nome (quem está preenchendo)</span>
        <input value={quem} onChange={(e) => setQuem(e.target.value)} placeholder={`ex.: Fulano, produtor do ${artista.replace(/^DJ /, '')}`} autoComplete="name" />
      </label>

      {grupos.map((g, gi) => (
        <fieldset key={g.titulo} className="cad-grupo">
          <legend>
            <span className="cad-grupo__num">{String(gi + 1).padStart(2, '0')}</span>
            <span className="cad-grupo__titulo">{g.titulo}</span>
            {g.pagina && <span className="cad-grupo__pagina">{g.pagina}</span>}
          </legend>
          {g.perguntas.map((p) => (
            <div key={p.id} className="cad-campo">
              <label htmlFor={`c-${p.id}`}>{p.rotulo}</label>
              {p.ajuda && <small>{p.ajuda}</small>}
              {p.tipo === 'opcoes' && p.opcoes ? (
                <div className="cad-opcoes" role="group" aria-label={p.rotulo}>
                  {p.opcoes.map((op) => {
                    const on = (resp[p.id] ?? '').split(', ').includes(op);
                    return <button type="button" key={op} className={`cad-opcao${on ? ' cad-opcao--on' : ''}`} aria-pressed={on} onClick={() => marca(p.id, op)}>{op}</button>;
                  })}
                </div>
              ) : p.tipo === 'longo' ? (
                <textarea id={`c-${p.id}`} rows={3} value={resp[p.id] ?? ''} onChange={(e) => muda(p.id, e.target.value)} />
              ) : (
                <input id={`c-${p.id}`} value={resp[p.id] ?? ''} onChange={(e) => muda(p.id, e.target.value)} />
              )}
            </div>
          ))}
        </fieldset>
      ))}

      <div className="cad-envio">
        <p className="h4">Pronto? Envie as respostas para a Royals.</p>
        <p className="lead">O botão abre o WhatsApp com tudo escrito: é só escolher o contato da Royals e enviar. Se preferir, copie ou baixe o arquivo.</p>
        <div className="cad-envio__botoes">
          <a className="botao botao--lg" href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener">Enviar pelo WhatsApp <span className="seta" aria-hidden="true">→</span></a>
          <button type="button" className="botao botao--lg botao--secundario" onClick={copiar}>{copiado ? 'Copiado' : 'Copiar respostas'}</button>
          <button type="button" className="botao botao--lg botao--fantasma" onClick={baixar}>Baixar .txt ↓</button>
        </div>
        <p className="cad-envio__nota">As respostas ficam salvas só neste aparelho enquanto você preenche; nada é enviado sem você clicar.</p>
      </div>
    </form>
  );
}
