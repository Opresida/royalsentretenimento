import type { Metadata } from 'next';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { CopiaEmail } from './CopiaEmail';
import CASAS_WHATSAPP from './casas-whatsapp.json';
import './relatorio.css';

// Relatório de prospecção por artista do casting (pedido do Humberto, 20/11/2026): quantas casas a Royals mapeou, quais
// receberam o e-mail e quais foram abordadas pelo WhatsApp por não terem e-mail, só com nome e endereço, e a cópia do
// e-mail de apresentação do artista com o cachê oculto (R$ ****).
// Fontes: pecas/prospeccao-casas/saida-casas/envios.json (disparo de 17/11 pelo Brevo, e-mail com os dois DJs),
// captacao-casas-2026-11-17.csv (72 casas e produtoras mapeadas, endereços) e gerar-whatsapp-casas.py (contatos com
// WhatsApp, menos os que receberam e-mail; gerado em casas-whatsapp.json). As cópias em public/relatorio/email-<slug>.html
// são o e-mail solo de cada DJ com o nome do All Night Pub no lugar de [NOME DA CASA].
// Páginas de link direto: fora do menu e do sitemap, e sem indexação.

export type Artista = { slug: string; nome: string };

export function metadataRelatorio({ slug, nome }: Artista): Metadata {
  const titulo = `Relatório de prospecção · ${nome}`;
  const descricao = `As casas de show que já receberam a proposta do ${nome}.`;
  const url = `/relatorio/email/${slug}`;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    robots: { index: false, follow: false },
    // a imagem vem de opengraph-image.jpg na pasta da rota (fonte em pecas/og-relatorio-email-<slug>/og.html)
    openGraph: { title: `${titulo} · Royals`, description: descricao, url, siteName: 'Royals Entretenimento', locale: 'pt_BR', type: 'website' },
    twitter: { card: 'summary_large_image', title: `${titulo} · Royals`, description: descricao },
  };
}

type Casa = { nome: string; endereco: string; cidade: string };

const MAPEADAS = 72; // linhas da planilha de captação de 17/11 (Manaus + Boa Vista)

const CASAS_EMAIL: Casa[] = [
  { nome: 'All Night Pub', endereco: 'Av. Efigênio Salles, 2085 · Aleixo', cidade: 'Manaus · AM' },
  { nome: 'Porão do Alemão', endereco: 'Tv. Ponta Negra, 211 · São Jorge', cidade: 'Manaus · AM' },
  { nome: 'Nova Era Hall (Studio 5)', endereco: 'Av. Rodrigo Otávio, 3555 · Distrito Industrial', cidade: 'Manaus · AM' },
  { nome: 'Open Bar & Food', endereco: 'Av. Via Láctea, 14 · Adrianópolis', cidade: 'Manaus · AM' },
  { nome: 'Flutuante Sun Paradise', endereco: 'Igarapé do Tarumã-Açu', cidade: 'Manaus · AM' },
  { nome: 'Ícone Club', endereco: 'Av. Brig. Eduardo Gomes · Mecejana', cidade: 'Boa Vista · RR' },
  { nome: 'Galpão 95', endereco: 'Av. Ville Roy, 1865 · Caçari', cidade: 'Boa Vista · RR' },
];

const NUMEROS = [
  { valor: MAPEADAS, rotulo: 'casas mapeadas' },
  { valor: CASAS_EMAIL.length, rotulo: 'receberam por e-mail' },
  { valor: CASAS_WHATSAPP.length, rotulo: 'receberam no WhatsApp' },
];

const porCidade = (casas: Casa[], prefixo: string) => casas.filter((c) => c.cidade.startsWith(prefixo)).length;

function ListaCasas({ casas }: { casas: Casa[] }) {
  return (
    <ol className="rel-casas">
      {casas.map((c, i) => (
        <li key={c.nome} className="rel-casa">
          <span className="rel-casa__num">{String(i + 1).padStart(2, '0')}</span>
          <span className="rel-casa__nome">{c.nome}</span>
          <span className="rel-casa__end">{c.endereco && <>{c.endereco}<br /></>}{c.cidade}</span>
        </li>
      ))}
    </ol>
  );
}

export function RelatorioEmail({ slug, nome }: Artista) {
  return (
    <main className="pagina-topo rel">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container pilha" style={{ gap: 'var(--space-12)' }}>
          <CabecalhoSecao
            nivel={1}
            olho="Relatório de prospecção"
            titulo="Casas que já receberam a proposta"
            descricao={`A Royals mapeou as casas de show de Manaus e Boa Vista e levou a proposta do ${nome} a cada uma: por e-mail quando a casa tem e-mail, pelo WhatsApp quando não tem.`}
          />

          <dl className="rel-numeros">
            {NUMEROS.map((n) => (
              <div key={n.rotulo} className="rel-numeros__item">
                <dt>{n.rotulo}</dt>
                <dd>{n.valor}</dd>
              </div>
            ))}
          </dl>

          <div className="rel-bloco">
            <h2 className="rel-bloco__titulo">Por e-mail <span className="rel-bloco__qtd">{CASAS_EMAIL.length} casas</span></h2>
            <p className="rel-nota">Enviados em 17 de novembro de 2026 · {porCidade(CASAS_EMAIL, 'Manaus')} em Manaus e {porCidade(CASAS_EMAIL, 'Boa Vista')} em Boa Vista.</p>
            <ListaCasas casas={CASAS_EMAIL} />
          </div>

          <div className="rel-bloco">
            <h2 className="rel-bloco__titulo">Pelo WhatsApp <span className="rel-bloco__qtd">{CASAS_WHATSAPP.length} casas</span></h2>
            <p className="rel-nota">Casas que não publicam e-mail e receberam a proposta direto no WhatsApp · {porCidade(CASAS_WHATSAPP, 'Manaus')} em Manaus e {porCidade(CASAS_WHATSAPP, 'Boa Vista')} em Boa Vista.</p>
            <ListaCasas casas={CASAS_WHATSAPP} />
          </div>

          <div className="rel-bloco">
            <h2 className="rel-bloco__titulo">O e-mail do {nome}</h2>
            <p className="rel-nota">Cópia do e-mail de apresentação, aqui com o nome do All Night Pub. Cada casa recebe com o nome e a cidade dela.</p>
            <CopiaEmail src={`/relatorio/email-${slug}.html`} />
          </div>
        </div>
      </section>
    </main>
  );
}
