import type { ItemGaleria } from '@/components/Galeria';
import { ano, capaDoVideo, dataCurta, eventoDoPost, limpaLegenda, nomeCompleto, tempoDeVideo, tipoDeVideo, type Midia, type Post } from './acervo';

/** Converte mídias do acervo no formato que a galeria (componente de navegador) recebe.
 *  Vídeos ganham a capa padronizada e o molde de texto (tipo · evento · ano · duração). */
export function itensGaleria(lista: (Midia & { post: Post })[], comEvento = false): ItemGaleria[] {
  return lista.map((m) => {
    const e = eventoDoPost(m.post);
    const leg = limpaLegenda(m.post.legenda);
    const video = m.tipo !== 'imagem';
    const capa = video ? capaDoVideo(m) : undefined;
    return {
      id: m.id, tipo: m.tipo, p: capa?.p ?? m.p, g: capa?.g ?? m.g, video: m.video, w: m.w, h: m.h, link: m.post.link,
      legenda: leg.length > 400 ? leg.slice(0, 400).trimEnd() + '…' : leg,
      meta: video ? undefined : comEvento && e ? `${nomeCompleto(e)} · ${ano(e.data)}` : `${dataCurta(m.post.data.slice(0, 10))}.${ano(m.post.data)}`,
      ...(video ? {
        rotulo: tipoDeVideo(m.post.legenda),
        titulo: e ? nomeCompleto(e) : 'Royals',
        detalhe: [ano(m.post.data), tempoDeVideo(m.duracao)].filter(Boolean).join(' · '),
      } : {}),
    };
  });
}
