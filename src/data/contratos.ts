// Artistas que o gerador de contratos (/contratos) conhece. Tudo vem das páginas de cada artista (src/data/artistas),
// para o contrato e a página nunca dizerem coisas diferentes. Artista novo no casting = uma entrada aqui.
import { RIDER as RIDER_BERTO, SHOW as SHOW_BERTO } from './artistas/bertolossi';
import { DURACAO as DURACAO_LUCCO, LUCCO, RIDER as RIDER_LUCCO } from './artistas/lucco';

export type BlocoRider = { titulo: string; itens: string[] };
export type ArtistaContrato = {
  slug: string;
  nome: string; // nome artístico, como entra no contrato
  logo: string; // versão escura, para papel claro
  base: string;
  generos: string;
  duracao: string; // o que a página diz da duração do set (só referência no formulário)
  formatos: string[];
  rider: BlocoRider[];
};

const comNota = ([item, nota]: readonly [string, string] | string[]) => (nota ? `${item} (${nota})` : item);

export const ARTISTAS_CONTRATO: ArtistaContrato[] = [
  {
    slug: 'bertolossi',
    nome: 'DJ BERTOLOSSI',
    logo: '/artistas/bertolossi/marca/bertolossi-preto.svg',
    base: 'São Gonçalo/RJ',
    generos: 'funk carioca',
    duracao: '45 minutos a 1 hora',
    formatos: ['Set solo', 'Versão light'],
    rider: [
      { titulo: 'Técnico', itens: [...RIDER_BERTO.tecnico] },
      { titulo: 'Desejável, se o local tiver', itens: [...RIDER_BERTO.seDer] },
      { titulo: 'Camarim', itens: [...RIDER_BERTO.camarim] },
    ],
  },
  {
    slug: 'lucco',
    nome: 'DJ LUCCO',
    logo: '/artistas/lucco/marca/lucco-preto.svg',
    base: LUCCO.base.replace(' · ', '/'),
    generos: LUCCO.generos.join(', '),
    duracao: DURACAO_LUCCO,
    formatos: ['Warm-up', 'Set principal', 'Sunset', 'Closing'],
    rider: [
      { titulo: 'Técnico', itens: RIDER_LUCCO.equipamento.map(comNota) },
      { titulo: 'Camarim e logística', itens: RIDER_LUCCO.camarim.map(comNota) },
    ],
  },
];

// referência para quem preenche: o que a página do artista diz do show
export const NOTA_SHOW: Record<string, string> = { bertolossi: SHOW_BERTO.titulo };
