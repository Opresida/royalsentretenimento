import { exigirAdmin } from '@/lib/financeiro/auth';
import Link from 'next/link';
import { FormEvento } from '@/components/financeiro/Formularios';

export const metadata = { title: 'Novo evento' };

export default async function NovoEvento() {
  await exigirAdmin(); // a página confere sozinha: o layout roda em paralelo e não protege o conteúdo
  return (
    <>
      <p className="fin-trilha"><Link href="/financeiro/eventos">Eventos</Link> / Novo</p>
      <h1 className="fin-titulo" style={{ marginBottom: 24 }}>Novo evento</h1>
      <FormEvento ev={{}} />
    </>
  );
}
