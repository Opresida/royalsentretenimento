import type { Metadata } from 'next';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { FormularioArtista, type Grupo } from '../FormularioArtista';
import '../cadastro.css';

// Cadastro de artista · DJ LUCCO (pedido do Humberto, 29/10/2026): o produtor do LUCCO preenche o que ainda falta no
// presskit e manda para a Royals. Página de link direto: fora do menu e do sitemap, e sem indexação.
export const metadata: Metadata = {
  title: 'Cadastro de artista · LUCCO',
  description: 'Informações que faltam para fechar o presskit do DJ LUCCO.',
  alternates: { canonical: '/cadastro-artista/lucco' },
  robots: { index: false, follow: false },
  // a imagem vem de opengraph-image.jpg nesta pasta (fonte em pecas/og-cadastro-lucco/og.html)
  openGraph: { title: 'Cadastro de artista · LUCCO · Royals', description: 'Informações que faltam para fechar o presskit do DJ LUCCO.', url: '/cadastro-artista/lucco', siteName: 'Royals Entretenimento', locale: 'pt_BR', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Cadastro de artista · LUCCO · Royals', description: 'Informações que faltam para fechar o presskit do DJ LUCCO.' },
};

// o que o presskit já tem (para o produtor não responder de novo)
const JA_TEMOS = [
  'Estilos: House e Tech House · DJ e produtor',
  'E-mail de booking: luccodjj@gmail.com',
  'SET SUNRISE: warm-up para LIU, ao vivo na Sunrise (2026)',
  'Ibiza, Espanha: Beach Club Ibiza e rádio da Playabout Ibiza',
  'Manipura Club, Shild Club e Bali Night (Nordeste), SUN RISE',
  'SUN HYPE On Board · III edição · 29.11.2026',
];

const GRUPOS: Grupo[] = [
  { titulo: 'Biografia', pagina: 'pág. 2', perguntas: [
    { id: 'cidade-nasceu', rotulo: 'Cidade onde o LUCCO nasceu' },
    { id: 'cidade-mora', rotulo: 'Cidade onde ele mora hoje', ajuda: 'É a cidade-base para calcular viagem e hospedagem.' },
    { id: 'inicio', rotulo: 'Ano em que começou a tocar e como começou', tipo: 'longo' },
  ] },
  { titulo: 'Palcos', pagina: 'pág. 5', perguntas: [
    { id: 'cidades', rotulo: 'Cidades onde ele já tocou', ajuda: 'Ibiza já está no presskit. Liste as outras, separadas por vírgula.', tipo: 'longo' },
    { id: 'manipura', rotulo: 'Em qual cidade fica o Manipura Club?' },
    { id: 'tipos', rotulo: 'Tipos de evento que ele atende', tipo: 'opcoes', opcoes: ['Clubes', 'Festas open-air', 'Sunset / pôr do sol', 'Beach party', 'Eventos privados', 'Festivais', 'Barco / boat party'] },
  ] },
  { titulo: 'SUN HYPE', pagina: 'pág. 4', perguntas: [
    { id: 'papel', rotulo: 'Qual é o papel dele na SUN HYPE?', tipo: 'opcoes', opcoes: ['Criador', 'Sócio', 'Residente', 'Outro'] },
    { id: 'papel-obs', rotulo: 'Se quiser, explique (opcional)' },
    { id: 'lineup', rotulo: 'Os outros 3 nomes do line-up de 29.11', ajuda: 'Já temos DJ MOMX, HYDEX e LUCCODJ.' },
  ] },
  { titulo: 'O som', pagina: 'pág. 3', perguntas: [
    { id: 'subgeneros', rotulo: 'Subgêneros que ele toca além de House e Tech House', tipo: 'opcoes', opcoes: ['Afro House', 'Melodic House', 'Deep House', 'Progressive', 'Minimal', 'Open format', 'Outro'] },
    { id: 'duracao-media', rotulo: 'Duração média do set', ajuda: 'ex.: 1h30 a 2h' },
  ] },
  { titulo: 'Rider técnico', pagina: 'pág. 6', perguntas: [
    { id: 'equipamento', rotulo: 'Equipamento exato da cabine', ajuda: 'Modelo de CDJ (ex.: CDJ-3000 ou CDJ-2000NXS2), mixer (ex.: DJM-900NXS2 ou DJM-A9) e retorno.', tipo: 'longo' },
    { id: 'camarim', rotulo: 'Camarim e logística', ajuda: 'Bebidas, acesso para quantas pessoas, passagem, hospedagem e transporte.', tipo: 'longo' },
  ] },
  { titulo: 'Formatos de set', pagina: 'pág. 7', perguntas: [
    { id: 'formatos', rotulo: 'Formatos que ele faz', tipo: 'opcoes', opcoes: ['Warm-up', 'Set principal', 'Sunset', 'Closing'] },
    { id: 'duracoes', rotulo: 'Duração de cada formato', ajuda: 'ex.: warm-up 1h · set principal 2h · sunset 3h · closing 1h30', tipo: 'longo' },
  ] },
  { titulo: 'Contato e fotos', pagina: 'págs. 8 e 9', perguntas: [
    { id: 'whatsapp', rotulo: 'WhatsApp de booking que vai no presskit' },
    { id: 'booking-de-quem', rotulo: 'O booking vai pelo contato do LUCCO ou pelo da Royals?', tipo: 'opcoes', opcoes: ['Contato do LUCCO', 'Contato da Royals'] },
    { id: 'creditos', rotulo: 'Créditos das fotos', ajuda: 'Já temos @bocaalvess. Quem mais fotografou?' },
    { id: 'drive', rotulo: 'Podemos usar a pasta do Drive como "baixe o pacote completo" no QR code?', tipo: 'opcoes', opcoes: ['Sim', 'Não, mando outro link'] },
  ] },
];

export default function CadastroLucco() {
  return (
    <main className="pagina-topo">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container pilha" style={{ gap: 'var(--space-10)' }}>
          <CabecalhoSecao nivel={1} olho="Cadastro de artista" titulo="DJ LUCCO" descricao="Informações que faltam para fechar o presskit. Responda o que souber; o que ficar em branco a gente completa depois." />
          <div className="pilha" style={{ gap: 'var(--space-3)' }}>
            <span className="rotulo-texto">O presskit já tem</span>
            <ul className="cad-ja">{JA_TEMOS.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          <FormularioArtista artista="DJ LUCCO" chave="lucco" grupos={GRUPOS} />
        </div>
      </section>
    </main>
  );
}
