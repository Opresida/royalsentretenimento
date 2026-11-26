// Quadro "Bilheteria × Bar": de onde veio o dinheiro do evento e quanto sobrou do bar.
// Aparece no Resumo, no Fechamento e na área do sócio (só números agregados). A prestação usa a própria tabela.
import type { Fontes } from '@/lib/financeiro/calculo';
import { reais } from '@/lib/financeiro/dinheiro';

export function QuadroFontes({ f, titulo = 'Bilheteria × Bar' }: { f: Fontes; titulo?: string }) {
  const vazio = !f.receitas && !f.bar.custo;
  const linhas: [string, number][] = [['Bilheteria', f.bilheteria]];
  if (f.camarote) linhas.push(['Camarote', f.camarote]);
  const extras: [string, number][] = [];
  if (f.patrocinio) extras.push(['Patrocínio', f.patrocinio]);
  if (f.outros) extras.push(['Outras receitas', f.outros]);
  const parte = (v: number) => (f.receitas > 0 ? Math.round((v / f.receitas) * 100) : 0);
  return (
    <section className="fin-bloco fin-fontes">
      <h2 className="fin-h2" style={{ fontSize: 14, marginBottom: 14 }}>{titulo}</h2>
      {vazio ? (
        <p className="fin-vazio" style={{ padding: '12px 4px' }}>Lance as receitas com a categoria Bilheteria ou Bar para ver a separação.</p>
      ) : (
        <>
          <div className="fin-fontes__grade">
            {linhas.map(([k, v]) => (
              <div key={k} className="fin-fontes__item">
                <span className="fin-rot">{k}</span>
                <b className="verde">{reais(v, { inteiro: true })}</b>
                <small>{parte(v)}% das receitas</small>
                <div className="fin-barra"><i style={{ width: `${parte(v)}%` }} /></div>
              </div>
            ))}
            <div className="fin-fontes__item">
              <span className="fin-rot">Bar · vendas</span>
              <b className="verde">{reais(f.bar.vendas, { inteiro: true })}</b>
              <small>{parte(f.bar.vendas)}% das receitas</small>
              <div className="fin-barra"><i style={{ width: `${parte(f.bar.vendas)}%` }} /></div>
            </div>
          </div>
          <div className="fin-fontes__bar">
            <div><span>Vendas do bar</span><b className="verde">{reais(f.bar.vendas)}</b></div>
            <div><span>− Custo do bar</span><b className="vermelho">{reais(f.bar.custo)}</b></div>
            <div className="fin-fontes__sobra"><span>= Sobra do bar</span><b className={f.bar.sobra >= 0 ? 'ouro' : 'vermelho'}>{reais(f.bar.sobra)}</b></div>
            {f.bar.vendas > 0 ? <small>Margem do bar: {Math.round((f.bar.sobra / f.bar.vendas) * 100)}%</small> : null}
          </div>
          {extras.length ? (
            <div className="fin-conta" style={{ marginTop: 6 }}>
              {extras.map(([k, v]) => <div key={k}><span>{k}</span><span className="verde">{reais(v)}</span></div>)}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
