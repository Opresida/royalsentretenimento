import type { Metadata } from 'next';
import { CabecalhoSecao } from '@/components/CabecalhoSecao';
import { FormularioArtista, type Grupo } from '../FormularioArtista';
import '../cadastro.css';

// Cadastro de artista · DJ BERTOLOSSI (pedido do Humberto, 30/10/2026): o escritório do Bertolossi preenche o que ainda
// falta para o presskit, a página /artistas/bertolossi e as artes. Página de link direto: fora do menu e do sitemap, e sem
// indexação. O que já está em "o que já levantamos" veio do Drive dele e de fontes públicas (Spotify, SoundCloud, O São
// Gonçalo); as perguntas pedem confirmação do que é público e o resto que não dá para achar.
export const metadata: Metadata = {
  title: 'Cadastro de artista · BERTOLOSSI',
  description: 'Informações que faltam para montar o presskit e a página do DJ BERTOLOSSI.',
  alternates: { canonical: '/cadastro-artista/bertolossi' },
  robots: { index: false, follow: false },
  // a imagem vem de opengraph-image.jpg nesta pasta (fonte em pecas/og-cadastro-bertolossi/og.html)
  openGraph: { title: 'Cadastro de artista · BERTOLOSSI · Royals', description: 'Informações que faltam para montar o presskit e a página do DJ BERTOLOSSI.', url: '/cadastro-artista/bertolossi', siteName: 'Royals Entretenimento', locale: 'pt_BR', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Cadastro de artista · BERTOLOSSI · Royals', description: 'Informações que faltam para montar o presskit e a página do DJ BERTOLOSSI.' },
};

// o que já levantamos (para o escritório só confirmar ou corrigir)
const JA_TEMOS = [
  'Matheus da Silva Bertolossi, cria do Morro do Martins, São Gonçalo (RJ)',
  'Começou aos 15 anos, inspirado em Yago Gomes, Selminho e R15',
  'Spotify: 82 mil ouvintes mensais · Vida Rasa 4-4-2 com 9,7 milhões de plays',
  'Piquezinho dos Crias (2,5 mi) e Tamborzinho do Martins (1,8 mi) no Spotify',
  'SoundCloud verificado: 75 mil seguidores · Sequência das Antigas 2 com 727 mil plays',
  'Instagram @djbertolossi com 135 mil seguidores · TikTok com 53 mil',
  'Faixas com MC Carol (Barbaridades, Conto do Vigário Remix)',
  'Turnê nos EUA em agosto de 2025: Boston e Filadélfia',
  'Escritório: (21) 99271-5243 · contatodjbertolossi@gmail.com',
  'Drive com 12 fotos, logo HITMAKER, vídeo de telão e 15 vídeos',
];

const GRUPOS: Grupo[] = [
  { titulo: 'Links e plataformas', pagina: 'página e presskit', perguntas: [
    { id: 'links-confirma', rotulo: 'Estes são os perfis oficiais?', ajuda: 'Instagram instagram.com/djbertolossi · Spotify open.spotify.com/artist/75MGRS4iY2kusB2g0i43Bq · SoundCloud soundcloud.com/djbertolossi · TikTok tiktok.com/@djbertolossi', tipo: 'opcoes', opcoes: ['Sim, todos oficiais', 'Tem algum errado (explico abaixo)'] },
    { id: 'soundcloud-2', rotulo: 'Existe um segundo SoundCloud (soundcloud.com/djbertolossi-scmusic). Ele é dele?', tipo: 'opcoes', opcoes: ['Sim, é dele', 'Não é dele', 'Não sei'] },
    { id: 'youtube', rotulo: 'Canal oficial no YouTube', ajuda: 'O link do canal dele (não o "Topic" automático). Se tiver clipes, cole os links também.', tipo: 'longo' },
    { id: 'outras-plataformas', rotulo: 'Links das outras plataformas', ajuda: 'Apple Music, Deezer, YouTube Music, Audiomack, Palco MP3, Sua Música, Kwai, Facebook, X (Twitter), Linktree, site. Um por linha.', tipo: 'longo' },
    { id: 'imprensa', rotulo: 'Matérias e entrevistas sobre ele', ajuda: 'Jornal, portal, TV, rádio, podcast. Já temos a do O São Gonçalo (EUA, ago/2025). Um link por linha.', tipo: 'longo' },
    { id: 'numeros', rotulo: 'Algum número que ele queira destacar', ajuda: 'ex.: plays somados, música que viralizou no TikTok, maior público, prêmio, playlist editorial do Spotify.', tipo: 'longo' },
    { id: 'links-correcao', rotulo: 'Correções nos links (se marcou que tem algum errado)' },
  ] },
  { titulo: 'Biografia', pagina: 'pág. 2', perguntas: [
    { id: 'nome-artistico', rotulo: 'Como o nome deve aparecer', tipo: 'opcoes', opcoes: ['DJ BERTOLOSSI', 'BERTOLOSSI', 'DJ BERTOLOSSI DO MARTINS', 'BERTOLOSSI HITMAKER'] },
    { id: 'nascimento', rotulo: 'Ano de nascimento', ajuda: 'O Spotify diz 28 anos, mas não sabemos de quando é o texto.' },
    { id: 'mora', rotulo: 'Cidade onde ele mora hoje', ajuda: 'É a cidade-base para calcular viagem e hospedagem.' },
    { id: 'carreira', rotulo: 'Ano em que virou profissional e os marcos da carreira', ajuda: 'Primeiro baile grande, primeiro hit, primeira turnê. A matéria fala em "segunda turnê internacional": qual foi a primeira?', tipo: 'longo' },
    { id: 'apelidos', rotulo: 'O que significam "Hitmaker" e "Rei / Apelão do Acid Pro"?', ajuda: 'Para explicar na bio do jeito certo.', tipo: 'longo' },
  ] },
  { titulo: 'Os hits', pagina: 'pág. 3', perguntas: [
    { id: 'top-hits', rotulo: 'Os hits que ele quer na vitrine, em ordem', ajuda: 'O perfil diz "+ de 10 hits". Quais são? Um por linha, com o MC de cada um.', tipo: 'longo' },
    { id: 'producao', rotulo: 'Desses, quais ele produziu e em quais participou?', tipo: 'longo' },
    { id: 'parcerias', rotulo: 'MCs e artistas com quem já gravou', ajuda: 'Na internet aparecem MC Carol, MC Kevin O Chris, Sodré, MC Mascara, Firma 21, DJ RD do Martins, DJ Lafon e DJ LC de Niterói. Confirme e complete.', tipo: 'longo' },
    { id: 'versao-light', rotulo: 'Algum hit tem também versão light? (opcional)', ajuda: 'Só para avisar o contratante de evento de empresa ou festa de família. A página mostra o Bertolossi como ele é.', tipo: 'longo' },
  ] },
  { titulo: 'Palcos', pagina: 'pág. 4', perguntas: [
    { id: 'casas', rotulo: 'Casas e eventos onde ele já tocou, com a cidade', ajuda: 'Os vídeos mostram Palm Club, Vitrinni, ITA Music, Country, All In, a festa da Larah Juca e o Baile do Martins. Diga a cidade de cada um e acrescente os outros.', tipo: 'longo' },
    { id: 'cidades', rotulo: 'Cidades e estados onde já tocou', ajuda: 'Boston e Filadélfia já estão. Separe por vírgula.', tipo: 'longo' },
    { id: 'maior-publico', rotulo: 'Maior público e show mais marcante', ajuda: 'ex.: o aniversário que lotou à 01h em São Gonçalo. Quantas pessoas, onde, quando.', tipo: 'longo' },
    { id: 'tipos', rotulo: 'Tipos de evento que ele atende', tipo: 'opcoes', opcoes: ['Baile de comunidade', 'Casa noturna', 'Festa universitária', 'Festival', 'Camarote / evento VIP', 'Evento privado / aniversário', 'Evento de empresa', 'Turnê fora do Brasil'] },
  ] },
  { titulo: 'O show', pagina: 'págs. 5 e 7', perguntas: [
    { id: 'estilos', rotulo: 'Estilos que ele toca', tipo: 'opcoes', opcoes: ['Funk carioca / Ritmo RJ', 'Tamborzão', 'Acid Pro', 'Sequência das antigas', 'Funk 150 BPM', 'Mandelão / funk SP', 'Open format (vários estilos)', 'Outro'] },
    { id: 'formatos', rotulo: 'Formatos de apresentação', tipo: 'opcoes', opcoes: ['Set de DJ solo', 'DJ + MC', 'Show com convidados', 'Set audiovisual com telão', 'Participação especial'] },
    { id: 'duracao', rotulo: 'Duração do set (mínima e máxima)', ajuda: 'ex.: 1h a 2h' },
    { id: 'equipe', rotulo: 'Quem viaja com ele e quantas pessoas', ajuda: 'MC, dançarinas, VJ, produtor, segurança.', tipo: 'longo' },
  ] },
  { titulo: 'Rider técnico', pagina: 'pág. 6', perguntas: [
    { id: 'equipamento', rotulo: 'Equipamento da cabine', ajuda: 'Modelo de CDJ ou controladora, mixer, retorno, microfone. Ele usa o próprio notebook?', tipo: 'longo' },
    { id: 'telao', rotulo: 'O vídeo de telão do Drive vai em todos os shows? Precisa de telão/LED?', tipo: 'longo' },
    { id: 'camarim', rotulo: 'Camarim e logística', ajuda: 'Bebidas, comida, acesso para quantas pessoas, passagem, hospedagem e transporte.', tipo: 'longo' },
  ] },
  { titulo: 'Contratação', pagina: 'pág. 8', perguntas: [
    { id: 'booking-de-quem', rotulo: 'No Amazonas a contratação é pela Royals. Para fora do Amazonas, a página mostra o contato do escritório?', tipo: 'opcoes', opcoes: ['Sim, mostra o escritório', 'Não, só a Royals aparece'] },
    { id: 'contato-confirma', rotulo: 'WhatsApp e e-mail de contratação estão certos?', ajuda: '(21) 99271-5243 e contatodjbertolossi@gmail.com. No Instagram também aparece (21) 97126-1919: de quem é?', tipo: 'longo' },
    { id: 'agenda', rotulo: 'Datas já fechadas ou bloqueadas nos próximos meses (opcional)', tipo: 'longo' },
  ] },
  { titulo: 'Fotos e vídeos', pagina: 'pág. 9', perguntas: [
    { id: 'fotos-ao-vivo', rotulo: 'Link com fotos dele tocando ao vivo', ajuda: 'O mais importante desta lista: hoje só temos fotos de estúdio. Cabine, pista cheia, baile, palco, EUA. Pasta do Drive, WeTransfer ou álbum, de preferência em alta.', tipo: 'longo' },
    { id: 'creditos-ao-vivo', rotulo: 'Quem fez as fotos ao vivo? (nome ou @)' },
    { id: 'creditos', rotulo: 'Quem fez as fotos de estúdio?', ajuda: 'O Drive tem dois ensaios: as fotos "DSC" e as "image000". Nome ou @ de cada fotógrafo.', tipo: 'longo' },
    { id: 'videos-uso', rotulo: 'Podemos usar os 15 vídeos do Drive na página e nas redes da Royals?', tipo: 'opcoes', opcoes: ['Sim, todos', 'Só alguns (explico abaixo)', 'Não'] },
    { id: 'videos-obs', rotulo: 'Se for só alguns, quais' },
    { id: 'drive', rotulo: 'Podemos usar a pasta do Drive como "baixe o pacote completo" no QR code?', tipo: 'opcoes', opcoes: ['Sim', 'Não, mando outro link'] },
    { id: 'mais-material', rotulo: 'Link de mais material (vídeos de palco em alta, logo em vetor)', ajuda: 'A logo em SVG, AI ou PDF ajuda muito; se não tiver, a gente vetoriza.', tipo: 'longo' },
  ] },
];

export default function CadastroBertolossi() {
  return (
    <main className="pagina-topo">
      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="container pilha" style={{ gap: 'var(--space-10)' }}>
          <CabecalhoSecao nivel={1} olho="Cadastro de artista" titulo="DJ BERTOLOSSI" descricao="Informações para montar o presskit e a página do Bertolossi na Royals. Responda o que souber; o que ficar em branco a gente completa depois." />
          <div className="pilha" style={{ gap: 'var(--space-3)' }}>
            <span className="rotulo-texto">O que já levantamos</span>
            <ul className="cad-ja">{JA_TEMOS.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          <FormularioArtista artista="DJ BERTOLOSSI" chave="bertolossi" grupos={GRUPOS} />
        </div>
      </section>
    </main>
  );
}
