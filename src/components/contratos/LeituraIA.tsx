'use client';
// Bloco "Preencher com IA" do /contratos: manda um PDF, uma foto ou um texto colado para /api/contratos/ler e devolve os
// campos achados. A senha da equipe fica guardada só neste aparelho depois da primeira vez.
import { useEffect, useRef, useState } from 'react';

export type DadosLidos = {
  contratante: Record<string, string>;
  evento: Record<string, string>;
  valores: Record<string, string>;
  observacoes: string;
};

const CHAVE_SENHA = 'royals-contratos-senha';
const MAX = 4 * 1024 * 1024;

/** Foto grande do celular: reduz para JPEG de até 2000 px antes de enviar (o limite da Vercel é 4,5 MB). */
async function preparar(f: File): Promise<File> {
  if (!f.type.startsWith('image/') || f.size <= 3 * 1024 * 1024) return f;
  const img = await createImageBitmap(f);
  const k = Math.min(1, 2000 / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, 'image/jpeg', 0.85));
  return blob ? new File([blob], f.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }) : f;
}

export function LeituraIA({ onDados }: { onDados: (d: DadosLidos) => string[] }) {
  const [senha, setSenha] = useState('');
  const [senhaSalva, setSenhaSalva] = useState(false);
  const [texto, setTexto] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [estado, setEstado] = useState<'livre' | 'lendo'>('livre');
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; linhas: string[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(CHAVE_SENHA);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- só no navegador
      if (s) { setSenha(s); setSenhaSalva(true); }
    } catch {}
  }, []);

  const ler = async () => {
    setMsg(null);
    if (!senha.trim()) { setMsg({ tipo: 'erro', linhas: ['Digite a senha da equipe.'] }); return; }
    if (!arquivo && !texto.trim()) { setMsg({ tipo: 'erro', linhas: ['Escolha um arquivo ou cole um texto.'] }); return; }
    setEstado('lendo');
    try {
      const fd = new FormData();
      if (texto.trim()) fd.append('texto', texto.trim());
      if (arquivo) {
        const pronto = await preparar(arquivo);
        if (pronto.size > MAX) { setMsg({ tipo: 'erro', linhas: ['Arquivo acima de 4 MB. Mande uma versão menor ou cole o texto.'] }); return; }
        fd.append('arquivo', pronto);
      }
      const r = await fetch('/api/contratos/ler', { method: 'POST', headers: { 'x-contratos-senha': senha.trim() }, body: fd });
      const j = await r.json().catch(() => ({ ok: false, error: 'Resposta inválida do servidor.' }));
      if (r.status === 401) { try { localStorage.removeItem(CHAVE_SENHA); } catch {} setSenhaSalva(false); }
      if (!j.ok) { setMsg({ tipo: 'erro', linhas: [j.error ?? 'Não deu para ler.'] }); return; }
      try { localStorage.setItem(CHAVE_SENHA, senha.trim()); } catch {}
      setSenhaSalva(true);
      const preenchidos = onDados(j.dados as DadosLidos);
      const linhas = [
        preenchidos.length ? `Preenchi ${preenchidos.length} ${preenchidos.length === 1 ? 'campo' : 'campos'}: ${preenchidos.join(', ')}.` : 'Não achei nada novo para preencher (os campos já estavam preenchidos ou o material não trazia esses dados).',
        ...(j.avisos as string[] ?? []),
        j.dados?.observacoes ? `Observação da leitura: ${j.dados.observacoes}` : '',
        'Confira tudo na prévia antes de baixar.',
      ].filter(Boolean);
      setMsg({ tipo: 'ok', linhas });
      setArquivo(null); setTexto('');
      if (inputRef.current) inputRef.current.value = '';
    } catch {
      setMsg({ tipo: 'erro', linhas: ['Sem conexão com o servidor. Tente de novo.'] });
    } finally {
      setEstado('livre');
    }
  };

  return (
    <fieldset className="gc-bloco gc-bloco--ia">
      <legend><b>0</b> Preencher com IA</legend>
      <p className="gc-dica">Mande o cartão CNPJ, o contrato social, o documento do contratante ou cole a conversa com os dados do evento. A IA preenche o que achar; o resto você completa. Os campos já preenchidos não são trocados.</p>
      {!senhaSalva ? (
        <label className="gc-campo" htmlFor="ia-senha"><span>Senha da equipe</span>
          <input id="ia-senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} /></label>
      ) : null}
      <label className="gc-campo gc-arquivo" htmlFor="ia-arquivo"><span>Arquivo (PDF ou foto, até 4 MB)</span>
        <input id="ia-arquivo" ref={inputRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} /></label>
      <label className="gc-campo" htmlFor="ia-texto"><span>Ou cole o texto</span>
        <textarea id="ia-texto" rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ex.: a mensagem do contratante com empresa, CNPJ, data, local e horário" /></label>
      <div className="gc-ia-acoes">
        <button type="button" className="gc-btn gc-btn--ouro" onClick={ler} disabled={estado === 'lendo'}>{estado === 'lendo' ? 'Lendo…' : 'Ler e preencher'}</button>
        {senhaSalva ? <button type="button" className="gc-btn gc-btn--leve" onClick={() => { try { localStorage.removeItem(CHAVE_SENHA); } catch {} setSenha(''); setSenhaSalva(false); }}>Trocar senha</button> : null}
      </div>
      {msg ? <div className={`gc-ia-msg gc-ia-msg--${msg.tipo}`} role="status" aria-live="polite">{msg.linhas.map((l) => <p key={l}>{l}</p>)}</div> : null}
      <p className="gc-dica">O arquivo passa pela IA (Google Gemini) só para a leitura e não fica guardado.</p>
    </fieldset>
  );
}
