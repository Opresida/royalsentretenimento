import { exigirAdmin } from '@/lib/financeiro/auth';
import Link from 'next/link';
import { FormSerie } from '@/components/financeiro/FormulariosSerie';

export const metadata = { title: 'Nova série recorrente' };

export default async function NovaSerie() {
  await exigirAdmin(); // a página confere sozinha: o layout roda em paralelo e não protege o conteúdo
  return (
    <>
      <p className="fin-trilha"><Link href="/financeiro/eventos">Eventos</Link> / Nova série recorrente</p>
      <h1 className="fin-titulo" style={{ marginBottom: 8 }}>Nova série recorrente</h1>
      <p className="fin-sub" style={{ marginBottom: 24, maxWidth: 640 }}>Para eventos que se repetem (toda semana, a cada 15 dias, todo mês). Os sócios e os custos fixos ficam na série; cada data vira uma edição com financeiro e fechamento próprios.</p>
      <FormSerie s={{}} />
    </>
  );
}
