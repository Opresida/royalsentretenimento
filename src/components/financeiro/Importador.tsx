'use client';
// Importar com IA: 1) escolhe o arquivo e a IA lê; 2) confere, corrige e marca o que entra; 3) lança.
// O arquivo fica só no navegador entre os passos e vai junto no "Lançar selecionados" (vira o comprovante).
import { useActionState, useRef, useState, useTransition } from 'react';
import { lancarImportados, lerArquivoImportar, type Estado } from '@/app/financeiro/acoes';
import type { Leitura } from '@/lib/financeiro/importar';
import { Arquivo } from './icones';

type Linha = { marcado: boolean; tipo: 'custo' | 'receita'; descricao: string; categoria: string; valorTxt: string; data: string; quitado: boolean };

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const txtValor = (c: number) => (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function centavos(t: string): number {
  let s = t.replace(/[R$\s]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : NaN;
}

export function Importador({ eventoId, categorias }: { eventoId: number; categorias: { custo: string[]; receita: string[] } }) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [leitura, setLeitura] = useState<Leitura | null>(null);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [lendo, iniciarLeitura] = useTransition();
  const [estado, lancar, lancando] = useActionState<Estado, FormData>(lancarImportados, null);
  const [, iniciarLancamento] = useTransition();
  const campo = useRef<HTMLInputElement>(null);

  function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setErro(null);
    if (f && f.size > 4 * 1024 * 1024) { setErro('O arquivo passa de 4 MB. Separe em partes menores ou mande um PDF mais leve.'); setArquivo(null); return; }
    setArquivo(f);
  }

  function ler() {
    if (!arquivo) { setErro('Escolha um arquivo.'); return; }
    setErro(null);
    const fd = new FormData();
    fd.set('eventoId', String(eventoId));
    fd.set('arquivo', arquivo);
    iniciarLeitura(async () => {
      const r = await lerArquivoImportar(fd).catch(() => ({ erro: 'A conexão caiu durante a leitura. Tente de novo.' }));
      if ('erro' in r) { setErro(r.erro); return; }
      setLeitura(r.leitura);
      setLinhas(r.leitura.itens.map((i) => ({ marcado: true, tipo: i.tipo, descricao: i.descricao, categoria: i.categoria, valorTxt: txtValor(i.valor), data: i.data ?? '', quitado: i.quitado })));
    });
  }

  const mudar = (i: number, p: Partial<Linha>) => setLinhas((ls) => ls.map((l, k) => (k === i ? { ...l, ...p } : l)));
  const marcadas = linhas.filter((l) => l.marcado);
  const receitas = marcadas.filter((l) => l.tipo === 'receita').reduce((s, l) => s + (centavos(l.valorTxt) || 0), 0);
  const custos = marcadas.filter((l) => l.tipo === 'custo').reduce((s, l) => s + (centavos(l.valorTxt) || 0), 0);
  const invalidas = marcadas.filter((l) => !Number.isFinite(centavos(l.valorTxt)) || !l.descricao.trim()).length;
  // conferência: na planilha vale a soma direta das colunas (feita pelo sistema); no PDF/foto, o total que a IA leu
  const total = leitura?.totalLido ?? null;
  const contas = [receitas, custos, receitas + custos, receitas - custos];
  const referencias = leitura?.somasCsv.length ? leitura.somasCsv.map((s) => ({ nome: `a soma da coluna “${s.coluna}”`, v: s.soma })) : total !== null ? [{ nome: 'o total do arquivo', v: total }] : [];
  const casou = referencias.find((ref) => contas.some((v) => Math.abs(v - ref.v) <= 1));
  const bate = referencias.length ? !!casou : null;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('eventoId', String(eventoId));
    fd.set('itens', JSON.stringify(marcadas.map((l) => ({ tipo: l.tipo, descricao: l.descricao.trim(), categoria: l.categoria, valor: l.valorTxt, data: l.data || null, quitado: l.quitado }))));
    if (arquivo) fd.set('arquivo', arquivo);
    iniciarLancamento(() => lancar(fd));
  }

  if (!leitura) {
    return (
      <section className="fin-bloco fin-importar" style={{ maxWidth: 720 }}>
        <div className="fin-anexo">
          <Arquivo />
          <b>{arquivo ? arquivo.name : 'Escolha o arquivo'}</b>
          <small>CSV (planilha salva como CSV), PDF ou foto · até 4 MB</small>
          <input ref={campo} type="file" accept=".csv,text/csv,application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={escolher} hidden />
          <div className="fin-anexo__botoes"><button type="button" className="fin-mini" onClick={() => campo.current?.click()}>{arquivo ? 'Trocar arquivo' : 'Escolher arquivo'}</button></div>
        </div>
        <ul className="fin-sub" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6, fontSize: 13 }}>
          <li>Relatório de ingressos com uma linha por pessoa é agrupado por lote e setor.</li>
          <li>Venda de bebida e comida vira receita do Bar; compra de bebida e insumos vira custo do Bar.</li>
          <li>Nada entra no evento antes de você conferir. O arquivo original fica anexado como comprovante.</li>
        </ul>
        {erro ? <p className="fin-aviso fin-aviso--erro" role="alert">{erro}</p> : null}
        {lendo ? <p className="fin-aviso fin-aviso--ambar" role="status">Lendo o arquivo com IA… pode levar até 1 minuto. Não feche esta tela.</p> : null}
        <div><button type="button" className="botao botao--lg" onClick={ler} disabled={!arquivo || lendo}>{lendo ? 'Lendo…' : 'Ler com IA'}</button></div>
      </section>
    );
  }

  return (
    <form onSubmit={enviar} className="fin-importar">
      <section className="fin-bloco">
        <div className="fin-bloco__cab">
          <h2 className="fin-h2">Confira antes de lançar</h2>
          <button type="button" className="fin-mini" onClick={() => { setLeitura(null); setLinhas([]); setArquivo(null); }}>Trocar arquivo</button>
        </div>
        <p className="fin-sub" style={{ marginTop: -6, marginBottom: 14, fontSize: 13 }}>{arquivo?.name} · {linhas.length} {linhas.length === 1 ? 'lançamento encontrado' : 'lançamentos encontrados'}</p>
        <div className="fin-imp-soma">
          <div><span className="fin-rot">Receitas marcadas</span><b className="verde">{brl(receitas)}</b></div>
          <div><span className="fin-rot">Custos marcados</span><b className="vermelho">{brl(custos)}</b></div>
          {total !== null ? <div><span className="fin-rot">Total no arquivo (IA)</span><b>{brl(total)}</b></div> : null}
          {leitura.somasCsv.map((s) => <div key={s.coluna}><span className="fin-rot">Soma da coluna “{s.coluna}”</span><b>{brl(s.soma)}</b><small className="fin-sub" style={{ fontSize: 11 }}>{s.linhas} linhas, conta direta da planilha</small></div>)}
        </div>
        {bate === true ? <p className="fin-aviso fin-aviso--ok" style={{ marginTop: 14 }}>Bate com {casou!.nome}.</p> : null}
        {bate === false ? <p className="fin-aviso fin-aviso--ambar" style={{ marginTop: 14 }}>Não bate com {referencias.length > 1 ? 'nenhuma coluna de valor da planilha' : referencias[0].nome}. Confira os valores ou se algum item ficou desmarcado.</p> : null}
        {leitura.observacoes ? <p className="fin-sub" style={{ marginTop: 14, fontSize: 13 }}><b className="ouro">Nota da IA:</b> {leitura.observacoes}</p> : null}
      </section>

      <section className="fin-bloco">
        <div className="fin-imp-lista">
          {linhas.map((l, i) => {
            const cats = categorias[l.tipo];
            const valorRuim = l.marcado && !Number.isFinite(centavos(l.valorTxt));
            return (
              <div key={i} className={`fin-imp-item ${l.marcado ? '' : 'fin-imp-item--off'}`}>
                <input type="checkbox" checked={l.marcado} onChange={(e) => mudar(i, { marcado: e.target.checked })} aria-label={`Lançar ${l.descricao}`} />
                <div className="fin-imp-campos">
                  <label className="fin-imp-desc"><span>Descrição</span><input value={l.descricao} onChange={(e) => mudar(i, { descricao: e.target.value })} maxLength={120} /></label>
                  <label><span>Tipo</span>
                    <select value={l.tipo} onChange={(e) => { const tipo = e.target.value as Linha['tipo']; mudar(i, { tipo, categoria: categorias[tipo].includes(l.categoria) ? l.categoria : 'Outros' }); }}>
                      <option value="receita">Receita</option><option value="custo">Custo</option>
                    </select>
                  </label>
                  <label><span>Categoria</span><select value={l.categoria} onChange={(e) => mudar(i, { categoria: e.target.value })}>{cats.map((c) => <option key={c}>{c}</option>)}</select></label>
                  <label><span>Valor (R$)</span><input inputMode="decimal" value={l.valorTxt} onChange={(e) => mudar(i, { valorTxt: e.target.value })} style={valorRuim ? { borderColor: 'var(--vermelho)' } : undefined} className={l.tipo === 'receita' ? 'verde' : 'vermelho'} /></label>
                  <label><span>{l.tipo === 'receita' ? 'Recebido?' : 'Pago?'}</span>
                    <select value={l.quitado ? 's' : 'n'} onChange={(e) => mudar(i, { quitado: e.target.value === 's' })}><option value="s">{l.tipo === 'receita' ? 'Recebido' : 'Pago'}</option><option value="n">{l.tipo === 'receita' ? 'A receber' : 'A pagar'}</option></select>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {estado?.erro ? <p className="fin-aviso fin-aviso--erro" role="alert">{estado.erro}</p> : null}
      <div className="fin-imp-barra">
        <span className="fin-sub" style={{ margin: 0 }}><b>{marcadas.length}</b> marcados{invalidas ? <span className="vermelho"> · {invalidas} com valor ou descrição para corrigir</span> : null}</span>
        <button className="botao" disabled={!marcadas.length || !!invalidas || lancando}>{lancando ? 'Lançando…' : `Lançar ${marcadas.length} no evento`}</button>
      </div>
    </form>
  );
}
