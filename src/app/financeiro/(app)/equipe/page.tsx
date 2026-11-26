import { agora } from '@/lib/financeiro/dinheiro';
import { headers } from 'next/headers';
import { alternarAdmin, renovarConvite } from '@/app/financeiro/acoes';
import { CopiarTexto, FormEquipe, FormSenha, FormSociosRoyals } from '@/components/financeiro/Formularios';
import { exigirAdmin } from '@/lib/financeiro/auth';
import { getDb, schema } from '@/db';
import { asc } from 'drizzle-orm';

export const metadata = { title: 'Equipe' };

export default async function Equipe() {
  const eu = await exigirAdmin();
  const db = await getDb();
  const admins = await db.select().from(schema.finAdmins).orderBy(asc(schema.finAdmins.id));
  const h = await headers();
  const origem = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}`;
  return (
    <>
      <div className="fin-cab"><div><p className="fin-rot">Só a Royals lança</p><h1 className="fin-titulo">Equipe</h1></div></div>
      <div className="fin-duas fin-duas--meio">
        <section className="fin-bloco">
          <h2 className="fin-h2" style={{ marginBottom: 14 }}>Quem tem acesso</h2>
          <ul className="fin-lista">
            {admins.map((a) => {
              const pendente = a.senhaHash === '!';
              const conviteVale = a.convite && a.conviteExpira && a.conviteExpira.getTime() > agora();
              return (
                <li key={a.id} className="fin-item" style={{ gridTemplateColumns: '1fr auto' }}>
                  <span className="fin-item__desc">{a.nome}{a.id === eu.id ? ' (você)' : ''}</span>
                  {a.id !== eu.id ? (
                    <form action={alternarAdmin}><input type="hidden" name="id" value={a.id} /><button className={`fin-mini ${a.ativo ? 'fin-mini--perigo' : ''}`}>{a.ativo ? 'Tirar acesso' : 'Devolver acesso'}</button></form>
                  ) : <span />}
                  <span className="fin-item__meta" style={{ display: 'flex' }}>
                    usuário {a.usuario} · {!a.ativo ? <span className="vermelho">sem acesso</span> : pendente ? <span className="ambar">ainda não criou a senha</span> : <span className="verde">ativo</span>}
                  </span>
                  {a.ativo && pendente ? (
                    <div style={{ gridColumn: '1 / -1' }}>
                      {conviteVale ? <CopiarTexto valor={`${origem}/financeiro/convite/${a.convite}`} rotulo={`Link de primeiro acesso de ${a.nome}`} /> : <p className="fin-sub ambar" style={{ fontSize: 13 }}>O convite expirou.</p>}
                      <form action={renovarConvite} style={{ marginTop: 8 }}><input type="hidden" name="id" value={a.id} /><button className="fin-mini">Gerar convite novo</button></form>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
        <div>
          <section className="fin-bloco" id="socios-royals">
            <h2 className="fin-h2" style={{ marginBottom: 6 }}>Sócios da Royals</h2>
            <p className="fin-sub" style={{ marginBottom: 16 }}>A % de cada sócio no Caixa Royals. O Caixa mostra quanto do saldo e do resultado do mês cabe a cada um, depois de tudo abatido. Deixe vazio quem não é sócio.</p>
            <FormSociosRoyals pessoas={admins.filter((a) => a.ativo).map((a) => ({ id: a.id, nome: a.nome, cotaBp: a.cotaBp ?? null, pendente: a.senhaHash === '!' }))} />
          </section>
          <section className="fin-bloco"><h2 className="fin-h2" style={{ marginBottom: 14 }}>Adicionar pessoa da Royals</h2><FormEquipe /></section>
          <section className="fin-bloco"><h2 className="fin-h2" style={{ marginBottom: 14 }}>Trocar minha senha</h2><FormSenha /></section>
        </div>
      </div>
    </>
  );
}
