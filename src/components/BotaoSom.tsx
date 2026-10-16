'use client';
import { useSyncExternalStore } from 'react';
import { somTopo } from '@/lib/somTopo';

/** Botão de som do vídeo do topo, na fileira de botões do evento. Só aparece quando o vídeo que está tocando tem trilha.
 *  Desligado, pulsa de leve na cor do evento (chamando o toque); ligado, as três barras da marca viram equalizador.
 *  No celular, fica só o ícone. */
export function BotaoSom() {
  const { disponivel, ligado } = useSyncExternalStore(somTopo.assinar, somTopo.ler, somTopo.lerNoServidor);
  if (!disponivel) return null;
  return (
    <button type="button" className="botao-som" aria-pressed={ligado} onClick={() => somTopo.alternar()}
      aria-label={ligado ? 'Desligar o som do vídeo' : 'Ligar o som do vídeo'}>
      {ligado
        ? <span className="botao-som__barras" aria-hidden="true"><span /><span /><span /></span>
        : (
          <svg className="botao-som__icone" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
            <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" fill="none" />
          </svg>
        )}
      <span className="botao-som__texto">{ligado ? 'Som ligado' : 'Ative o som'}</span>
    </button>
  );
}
