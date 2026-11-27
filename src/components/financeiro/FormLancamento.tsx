'use client';
// Lançamento de custo ou receita. Pensado para o celular no meio do evento: valor grande, categoria em um toque,
// comprovante opcional (câmera ou arquivo). Foto é reduzida no próprio aparelho antes de subir (máx. 1600 px, JPEG).
import { useActionState, useRef, useState } from 'react';
import { salvarLancamento, type Estado } from '@/app/financeiro/acoes';
import { lerNumero, qtdTxt, reais, totalUnidade, unitTxt } from '@/lib/financeiro/dinheiro';
import { Arquivo, Camera, Clipe } from './icones';

type Inicial = {
  id?: number; tipo: 'custo' | 'receita'; descricao?: string; categoria?: string; valor?: string; quitado?: boolean;
  quantidade?: string; valorUnitario?: string; // preenchidos = lançamento por unidade
  data: string; vencimento?: string | null; mostrarAoSocio?: boolean; comprovante?: { id: number; nome: string } | null;
};

async function reduzirFoto(f: File): Promise<File> {
  if (!f.type.startsWith('image/') || f.type === 'image/gif' || f.size < 600_000) return f;
  try {
    const img = await createImageBitmap(f);
    const esc = Math.min(1, 1600 / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * esc); c.height = Math.round(img.height * esc);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
    if (!blob || blob.size >= f.size) return f;
    return new File([blob], f.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch { return f; }
}

export function FormLancamento({ eventoId, eventoNome, categorias, inicial, socios }: {
  eventoId: number | null; eventoNome: string; categorias: { custo: string[]; receita: string[] }; inicial: Inicial; socios: boolean;
}) {
  const [estado, acao, enviando] = useActionState<Estado, FormData>(salvarLancamento, null);
  const [tipo, setTipo] = useState<'custo' | 'receita'>(inicial.tipo);
  const [quitado, setQuitado] = useState(inicial.quitado ?? true);
  const lista = categorias[tipo];
  const catInicial = inicial.categoria && !lista.includes(inicial.categoria) ? 'outra' : (inicial.categoria ?? lista[0]);
  const [cat, setCat] = useState(catInicial);
  const [arquivo, setArquivo] = useState<string | null>(null);
  const campoArq = useRef<HTMLInputElement>(null);
  // por unidade: valor unitário × quantidade, total na hora (o servidor recalcula ao salvar)
  const [modo, setModo] = useState<'total' | 'unidade'>(inicial.quantidade && inicial.valorUnitario ? 'unidade' : 'total');
  const [unit, setUnit] = useState(inicial.valorUnitario ?? '');
  const [qtd, setQtd] = useState(inicial.quantidade ?? '');
  const u = lerNumero(unit), q = lerNumero(qtd);
  const totalOk = Number.isFinite(u) && u > 0 && Number.isFinite(q) && q > 0;

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const menor = await reduzirFoto(f);
    const dt = new DataTransfer(); dt.items.add(menor);
    if (campoArq.current) campoArq.current.files = dt.files;
    setArquivo(`${menor.name} · ${(menor.size / 1024 / 1024).toFixed(1).replace('.', ',')} MB`);
  }

  return (
    <form action={acao} className="fin-form">
      {inicial.id ? <input type="hidden" name="id" value={inicial.id} /> : null}
      {eventoId ? <input type="hidden" name="eventoId" value={eventoId} /> : null}
      <p className="fin-rot fin-rot--ouro">{eventoNome}</p>

      <div className="fin-alternar" role="radiogroup" aria-label="Tipo">
        <label><input type="radio" name="tipo" value="custo" checked={tipo === 'custo'} onChange={() => { setTipo('custo'); setCat(categorias.custo[0]); }} /><span className="custo">Custo</span></label>
        <label><input type="radio" name="tipo" value="receita" checked={tipo === 'receita'} onChange={() => { setTipo('receita'); setCat(categorias.receita[0]); }} /><span>Receita</span></label>
      </div>

      <div className="fin-alternar fin-alternar--baixo" role="radiogroup" aria-label="Como lançar o valor">
        <label><input type="radio" name="modo" value="total" checked={modo === 'total'} onChange={() => setModo('total')} /><span>Valor total</span></label>
        <label><input type="radio" name="modo" value="unidade" checked={modo === 'unidade'} onChange={() => setModo('unidade')} /><span>Por unidade</span></label>
      </div>

      {modo === 'total' ? (
        <label className="fin-campo"><span>Valor (R$)</span>
          <input name="valor" inputMode="decimal" autoComplete="off" placeholder="0,00" defaultValue={inicial.valor} required className="fin-valor-grande" />
        </label>
      ) : (
        <div className="fin-unidade">
          <div className="fin-linha2">
            <label className="fin-campo"><span>Valor unitário (R$)</span>
              <input name="valorUnitario" inputMode="decimal" autoComplete="off" placeholder="0,70" value={unit} onChange={(e) => setUnit(e.target.value)} required />
            </label>
            <label className="fin-campo"><span>Quantidade</span>
              <input name="quantidade" inputMode="decimal" autoComplete="off" placeholder="300" value={qtd} onChange={(e) => setQtd(e.target.value)} required />
            </label>
          </div>
          <div className="fin-unidade__total" aria-live="polite">
            <span>{totalOk ? `${qtdTxt(q)} × ${unitTxt(u)}` : 'Valor da unidade × quantidade'}</span>
            <b>{totalOk ? reais(totalUnidade(q, u)) : 'R$ 0,00'}</b>
          </div>
        </div>
      )}

      <label className="fin-campo"><span>Descrição</span>
        <input name="descricao" defaultValue={inicial.descricao} placeholder={modo === 'unidade' ? (tipo === 'custo' ? 'Ex.: Pulseira' : 'Ex.: Ingresso 1º lote') : tipo === 'custo' ? 'Ex.: Cachê do DJ · 2ª parcela' : 'Ex.: Bilheteria do 1º lote'} required maxLength={140} />
      </label>

      <fieldset className="fin-campo" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="fin-legenda" style={{ marginBottom: 8 }}>Categoria</legend>
        <div className="fin-chips">
          {lista.map((c) => (
            <label key={c}><input type="radio" name="categoria" value={c} checked={cat === c} onChange={() => setCat(c)} /><span>{c}</span></label>
          ))}
          <label><input type="radio" name="categoria" value="" checked={cat === 'outra'} onChange={() => setCat('outra')} /><span>+ Outra</span></label>
        </div>
        {cat === 'outra' ? <input name="categoriaOutra" placeholder="Nome da categoria" defaultValue={catInicial === 'outra' ? inicial.categoria : ''} maxLength={40} required style={{ marginTop: 10 }} /> : null}
      </fieldset>

      <div className="fin-campo"><span>Situação</span>
        <div className="fin-alternar" role="radiogroup" aria-label="Situação">
          <label><input type="radio" name="quitado" value="sim" checked={quitado} onChange={() => setQuitado(true)} /><span>{tipo === 'custo' ? 'Pago' : 'Recebido'}</span></label>
          <label><input type="radio" name="quitado" value="nao" checked={!quitado} onChange={() => setQuitado(false)} /><span className="pendente">{tipo === 'custo' ? 'A pagar' : 'A receber'}</span></label>
        </div>
      </div>

      <div className="fin-linha2">
        <label className="fin-campo"><span>Data</span><input type="date" name="data" defaultValue={inicial.data} required /></label>
        {!quitado ? <label className="fin-campo"><span>Vencimento</span><input type="date" name="vencimento" defaultValue={inicial.vencimento ?? ''} /></label> : <span />}
      </div>

      <div className="fin-anexo">
        <Clipe className="" />
        <b>Anexar comprovante</b>
        <small>opcional · foto, PDF ou print (até 4 MB)</small>
        {inicial.comprovante && !arquivo ? (
          <span className="fin-anexo__arquivo">Já tem: <a href={`/financeiro/comprovante/${inicial.comprovante.id}`} target="_blank" rel="noreferrer">{inicial.comprovante.nome}</a></span>
        ) : null}
        {arquivo ? <span className="fin-anexo__arquivo">{arquivo}</span> : null}
        <input ref={campoArq} type="file" name="comprovante" accept="image/*,application/pdf" hidden onChange={escolher} id="arq" />
        <input type="file" accept="image/*" capture="environment" hidden onChange={escolher} id="cam" />
        <div className="fin-anexo__botoes">
          <label htmlFor="cam" className="fin-mini"><Camera />Câmera</label>
          <label htmlFor="arq" className="fin-mini"><Arquivo />Arquivo</label>
        </div>
        {inicial.comprovante ? <label className="fin-check" style={{ fontSize: 13 }}><input type="checkbox" name="removerComprovante" />Remover o comprovante atual</label> : null}
      </div>

      {socios ? (
        <label className="fin-check">
          <input type="checkbox" name="mostrarAoSocio" defaultChecked={inicial.mostrarAoSocio} />
          <span>Mostrar o comprovante aos sócios<small>O lançamento aparece para eles de qualquer jeito; você escolhe se o comprovante também aparece.</small></span>
        </label>
      ) : null}

      {estado?.erro ? <p className="fin-aviso fin-aviso--erro" role="alert">{estado.erro}</p> : null}
      <div className="fin-salvar">
        <button className="botao botao--lg" disabled={enviando}>{enviando ? 'Salvando…' : inicial.id ? 'Salvar alteração' : 'Salvar lançamento'}</button>
      </div>
    </form>
  );
}
