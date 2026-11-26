'use client';
// "Tempo real" da área do sócio e do admin: recarrega os dados do servidor a cada 20 s com a aba visível
// e mostra há quanto tempo foi a última atualização.
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AoVivo({ em, intervalo = 20000 }: { em: number; intervalo?: number }) {
  const router = useRouter();
  const [agora, setAgora] = useState(em);
  useEffect(() => {
    const t = setInterval(() => {
      setAgora(Date.now());
      if (document.visibilityState === 'visible') router.refresh();
    }, intervalo);
    const volta = () => { if (document.visibilityState === 'visible') router.refresh(); };
    document.addEventListener('visibilitychange', volta);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', volta); };
  }, [router, intervalo]);
  const min = Math.floor(Math.max(0, agora - em) / 60000);
  return <span className="fin-sub" style={{ marginTop: 0 }}>{min < 1 ? 'atualizado agora' : `atualizado há ${min} min`}</span>;
}

export function Imprimir() {
  return <button type="button" className="botao" onClick={() => window.print()}>Salvar em PDF / imprimir</button>;
}
