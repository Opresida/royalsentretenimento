// O som do vídeo do topo (pedido do Humberto, 16/10: "deixar a opção de rolar o som do vídeo do hero, o som do artista
// que vamos vender"). O vídeo começa sempre mudo (os navegadores só deixam tocar sozinho assim) e o botão de som, que fica
// na fileira de botões do topo, liga a trilha com um toque. Os dois estão em componentes diferentes (VideoTopo e
// BotaoSom): conversam por este estado pequeno, lido com useSyncExternalStore.

export type EstadoSom = { disponivel: boolean; ligado: boolean };
const INICIAL: EstadoSom = { disponivel: false, ligado: false };
let estado = INICIAL;
const ouvintes = new Set<() => void>();
let alternador: (() => void) | null = null;

export const somTopo = {
  ler: () => estado,
  lerNoServidor: () => INICIAL,
  assinar(fn: () => void) { ouvintes.add(fn); return () => { ouvintes.delete(fn); }; },
  definir(parcial: Partial<EstadoSom>) { estado = { ...estado, ...parcial }; ouvintes.forEach((f) => f()); },
  /** o VideoTopo registra quem liga e desliga o som do vídeo que está tocando */
  registrar(fn: (() => void) | null) { alternador = fn; },
  alternar() { alternador?.(); },
};
