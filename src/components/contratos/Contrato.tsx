/* eslint-disable @next/next/no-img-element -- documento para impressão: <img> simples sai igual na prévia e no PDF */
// Contrato de apresentação artística (venda de show) da Royals, no papel timbrado. Componente puro: recebe os dados do
// formulário (/contratos) e devolve o documento. Campo vazio aparece marcado em amarelo com o nome do que falta.
// Regra: nenhum valor, percentual ou prazo vem de fábrica; tudo o que é número sai do formulário.
import type { ArtistaContrato } from '@/data/contratos';
import { brl, reaisPorExtenso } from '@/lib/extenso';
import type { EMPRESA as EmpresaT } from '@/lib/site';

export type Quem = 'contratante' | 'royals' | 'na';
export type DadosContrato = {
  numero: string;
  evento: { nome: string; data: string; horario: string; duracao: string; formato: string; local: string; endereco: string; cidade: string; publico: string; passagemSom: string; chegada: string };
  contratante: { tipo: 'pj' | 'pf'; nome: string; doc: string; rgIe: string; endereco: string; representante: string; repCpf: string; email: string; whatsapp: string };
  valores: { cache: number | null; modo: 'sinal' | 'unico'; sinal: number | null; sinalData: string; saldoData: string; unicoData: string; pagamento: string; multa: string; remarcarDias: string; devolucaoDias: string };
  logistica: { passagem: Quem; hospedagem: Quem; alimentacao: Quem; translado: Quem; equipe: string; origem: string };
  extras: { reservaComSinal: boolean; saldoAntes: boolean; especiais: string };
  assinatura: { cidade: string; data: string };
};

type Empresa = typeof EmpresaT;

const F = ({ v, rot }: { v?: string | null; rot: string }) => (v && v.trim() ? <>{v.trim()}</> : <mark className="cdoc-falta">[{rot}]</mark>);

export const dataLonga = (iso: string, semana = false) => {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { ...(semana ? { weekday: 'long' } : {}), day: 'numeric', month: 'long', year: 'numeric' });
};
const dataCurta = (iso: string) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR') : '');
const valor = (n: number | null) => (n != null && n > 0 ? `${brl(n)} (${reaisPorExtenso(n)})` : '');
const QUEM_TXT: Record<Quem, string> = { contratante: 'por conta do CONTRATANTE', royals: 'por conta da CONTRATADA', na: 'não se aplica' };

export function Timbrado({ artista, empresa, booking, site, children }: { artista: ArtistaContrato | null; empresa: Empresa; booking: string; site: string; children: React.ReactNode }) {
  return (
    <div className="cdoc">
      {/* coroa em marca d'água: fixa no papel, repete em toda página impressa */}
      <img className="cdoc-dagua" src="/marca/royals-symbol-gold.svg" alt="" aria-hidden="true" />
      <table className="cdoc-folha">
        <thead><tr><td>
          <header className="cdoc-topo">
            <img className="cdoc-topo__royals" src="/marca/royals-gold-on-light.svg" alt="Royals Entretenimento" />
            {artista ? <img className="cdoc-topo__artista" src={artista.logo} alt={artista.nome} /> : <span className="cdoc-topo__casting">Casting Royals</span>}
          </header>
          <div className="cdoc-faixa" aria-hidden="true" />
        </td></tr></thead>
        <tfoot><tr><td>
          <footer className="cdoc-pe">
            <img className="cdoc-pe__records" src="/marca/royals-records.png" alt="Royals Records" />
            <div className="cdoc-pe__txt">
              <span><b>{empresa.marca}</b> · CNPJ {empresa.cnpj} · {empresa.endereco}</span>
              <span>Booking {booking} · {site.replace(/^https?:\/\//, '')}</span>
            </div>
          </footer>
        </td></tr></tfoot>
        <tbody><tr><td><article className="cdoc-corpo">{children}</article></td></tr></tbody>
      </table>
    </div>
  );
}

export function Contrato({ d, artista, empresa }: { d: DadosContrato; artista: ArtistaContrato | null; empresa: Empresa }) {
  const { evento: e, contratante: c, valores: v, logistica: l, extras: x } = d;
  const pj = c.tipo === 'pj';
  const saldo = v.cache != null && v.sinal != null ? Math.max(0, v.cache - v.sinal) : null;
  const pct = v.cache && v.sinal ? Math.round((v.sinal / v.cache) * 1000) / 10 : null;
  const nomeArt = artista?.nome ?? '';
  // números das cláusulas: "Condições especiais" só existe quando preenchida, e empurra as seguintes
  const esp = x.especiais.trim().length > 0;
  const N = { objeto: 1, cache: 2, contratante: 3, contratada: 4, imagem: 5, cancel: 6, forca: 7, rescisao: 8, especiais: 9, gerais: esp ? 10 : 9, foro: esp ? 11 : 10 };
  const cl = (num: number, t: string) => <h3 className="cdoc-clausula">Cláusula {num} · {t}</h3>;

  return (
    <>
      <div className="cdoc-titulo">
        <span className="cdoc-sobre">Contrato nº <F v={d.numero} rot="número" /></span>
        <h2>Contrato de apresentação artística</h2>
        <p className="cdoc-sub"><F v={nomeArt} rot="artista" /> · <F v={e.nome} rot="evento" /> · <F v={dataCurta(e.data)} rot="data do show" /></p>
      </div>

      <h3 className="cdoc-clausula cdoc-clausula--partes">As partes</h3>
      <p>
        <b>CONTRATADA:</b> {empresa.razaoSocial}, {empresa.tipo}, inscrito no CNPJ sob o nº {empresa.cnpj}, com sede na {empresa.endereco}, que atua sob a marca <b>{empresa.marca}</b>, neste ato representada por seu {empresa.cargo}, {empresa.representante}.
      </p>
      {pj ? (
        <p>
          <b>CONTRATANTE:</b> <F v={c.nome} rot="razão social do contratante" />, pessoa jurídica inscrita no CNPJ sob o nº <F v={c.doc} rot="CNPJ" />
          {c.rgIe ? <>, inscrição estadual {c.rgIe}</> : null}, com sede na <F v={c.endereco} rot="endereço do contratante" />, neste ato representada por <F v={c.representante} rot="representante" />, CPF <F v={c.repCpf} rot="CPF do representante" />
          {c.email || c.whatsapp ? <> (contato: {[c.email, c.whatsapp].filter(Boolean).join(' · ')})</> : null}.
        </p>
      ) : (
        <p>
          <b>CONTRATANTE:</b> <F v={c.nome} rot="nome do contratante" />, pessoa física, CPF <F v={c.doc} rot="CPF" />
          {c.rgIe ? <>, RG {c.rgIe}</> : null}, residente na <F v={c.endereco} rot="endereço do contratante" />
          {c.email || c.whatsapp ? <> (contato: {[c.email, c.whatsapp].filter(Boolean).join(' · ')})</> : null}.
        </p>
      )}
      <p>As partes acima têm entre si justo e contratado o que segue.</p>

      {cl(N.objeto, 'Objeto')}
      <p>{N.objeto}.1. Este contrato tem por objeto a apresentação artística de <b><F v={nomeArt} rot="artista" /></b>, artista do casting da CONTRATADA, que detém a agenda e a negociação desta data, no evento descrito abaixo:</p>
      <table className="cdoc-ficha"><tbody>
        <tr><th>Evento</th><td><F v={e.nome} rot="nome do evento" /></td></tr>
        <tr><th>Data</th><td><F v={dataLonga(e.data, true)} rot="data" /></td></tr>
        <tr><th>Horário do show</th><td><F v={e.horario} rot="horário" /></td></tr>
        <tr><th>Duração</th><td><F v={e.duracao} rot="duração do set" /></td></tr>
        <tr><th>Formato</th><td><F v={e.formato} rot="formato" /></td></tr>
        <tr><th>Local</th><td><F v={e.local} rot="local" /></td></tr>
        <tr><th>Endereço</th><td><F v={e.endereco} rot="endereço do local" />{e.cidade ? <>, {e.cidade}</> : <>, <F v="" rot="cidade/UF" /></>}</td></tr>
        {e.publico ? <tr><th>Público estimado</th><td>{e.publico}</td></tr> : null}
      </tbody></table>
      <p>{N.objeto}.2. Mudança de data, horário, local ou duração só vale se as duas partes concordarem por escrito (e-mail ou WhatsApp servem).</p>

      {cl(N.cache, 'Cachê e pagamento')}
      <p>{N.cache}.1. Pela apresentação, o CONTRATANTE pagará à CONTRATADA o cachê total de <b><F v={valor(v.cache)} rot="valor do cachê" /></b>.</p>
      {v.modo === 'sinal' ? (
        <>
          <p>{N.cache}.2. O pagamento será feito em duas partes:</p>
          <ul className="cdoc-lista">
            <li><b>Sinal:</b> <F v={valor(v.sinal)} rot="valor do sinal" />{pct ? <> ({pct.toLocaleString('pt-BR')}% do cachê)</> : null}, até <F v={dataCurta(v.sinalData)} rot="data do sinal" />;</li>
            <li><b>Saldo:</b> <F v={valor(saldo)} rot="saldo" />, até <F v={dataCurta(v.saldoData)} rot="data do saldo" />.</li>
          </ul>
        </>
      ) : (
        <p>{N.cache}.2. O pagamento será feito de uma só vez, até <F v={dataCurta(v.unicoData)} rot="data do pagamento" />.</p>
      )}
      <p>{N.cache}.3. Os pagamentos serão feitos por Pix ou transferência para a conta da CONTRATADA: <F v={v.pagamento} rot="dados bancários / chave Pix da Royals" />. O comprovante vale como recibo.</p>
      {x.reservaComSinal && v.modo === 'sinal' ? <p>{N.cache}.4. A data só fica reservada na agenda do artista depois que o sinal é pago.</p> : null}
      {x.saldoAntes ? <p>{N.cache}.{x.reservaComSinal && v.modo === 'sinal' ? 5 : 4}. Sem o pagamento integral no prazo acima, a CONTRATADA não é obrigada a realizar a apresentação, e o caso é tratado como cancelamento pelo CONTRATANTE (cláusula 6).</p> : null}

      {cl(N.contratante, 'Obrigações do contratante')}
      <p>{N.contratante}.1. Entregar montados e testados o som, a luz, o palco e o equipamento do rider técnico do artista (Anexo I){e.passagemSom ? <>, com passagem de som às {e.passagemSom}</> : null}.</p>
      <p>{N.contratante}.2. Oferecer camarim conforme o Anexo I, segurança para o artista e a equipe no acesso ao palco e ao camarim, e as credenciais da equipe.</p>
      <p>{N.contratante}.3. Despesas de viagem e estadia{l.equipe ? <> de {l.equipe} {Number(l.equipe) === 1 ? 'pessoa' : 'pessoas'} (artista e equipe)</> : null}{l.origem ? <>, saindo de {l.origem}</> : null}:</p>
      <table className="cdoc-ficha cdoc-ficha--logistica"><tbody>
        <tr><th>Passagens</th><td>{QUEM_TXT[l.passagem]}</td></tr>
        <tr><th>Hospedagem</th><td>{QUEM_TXT[l.hospedagem]}</td></tr>
        <tr><th>Alimentação</th><td>{QUEM_TXT[l.alimentacao]}</td></tr>
        <tr><th>Translado (aeroporto, hotel e evento)</th><td>{QUEM_TXT[l.translado]}</td></tr>
      </tbody></table>
      <p>{N.contratante}.4. Cuidar das licenças e alvarás do evento, do recolhimento dos direitos autorais (ECAD) e de tudo o que diz respeito ao público, à estrutura e à segurança do local.</p>

      {cl(N.contratada, 'Obrigações da contratada')}
      <p>{N.contratada}.1. Garantir a presença do artista no local, na data e no horário combinados{e.chegada ? <>, chegando com {e.chegada} de antecedência</> : null}.</p>
      <p>{N.contratada}.2. Enviar o rider, os nomes da equipe para credenciamento e o material oficial de divulgação (fotos, logo e texto do artista).</p>

      {cl(N.imagem, 'Divulgação e uso de imagem')}
      <p>{N.imagem}.1. O CONTRATANTE pode usar o nome, a imagem e a logo do artista só para divulgar este evento, com o material oficial enviado pela CONTRATADA. Peça com o artista passa pela aprovação da CONTRATADA antes de ser publicada.</p>
      <p>{N.imagem}.2. Fotos e vídeos curtos do show nas redes do evento estão liberados. Gravação profissional, transmissão ao vivo e uso do show em outro produto dependem de autorização por escrito da CONTRATADA.</p>

      {cl(N.cancel, 'Cancelamento e remarcação')}
      <p>{N.cancel}.1. Se o CONTRATANTE cancelar a apresentação, pagará multa de <F v={v.multa ? `${v.multa}%` : ''} rot="% da multa" /> do cachê total. O que já tiver sido pago é abatido da multa.</p>
      <p>{N.cancel}.2. Se a CONTRATADA cancelar sem motivo de força maior, devolverá o que recebeu e pagará a mesma multa ao CONTRATANTE.</p>
      <p>{N.cancel}.3. Remarcação de data depende de acordo por escrito{v.remarcarDias ? <>, com a nova data marcada em até {v.remarcarDias} dias</> : null}. Os valores pagos ficam para a nova data.</p>

      {cl(N.forca, 'Força maior')}
      <p>{N.forca}.1. Nenhuma das partes paga multa quando a apresentação não acontece por caso fortuito ou força maior (art. 393 do Código Civil), como doença do artista com atestado médico, acidente, cancelamento de voo pela companhia aérea, ordem de autoridade ou chuva e tempestade que impeçam o show.</p>
      <p>{N.forca}.2. Nesses casos, as partes buscam uma nova data. Sem acordo, os valores pagos são devolvidos{v.devolucaoDias ? <> em até {v.devolucaoDias} dias</> : <> no prazo combinado entre as partes</>}, descontadas as despesas de viagem já pagas e comprovadas.</p>

      {cl(N.rescisao, 'Rescisão')}
      <p>{N.rescisao}.1. O descumprimento de qualquer cláusula permite à parte prejudicada encerrar o contrato, com as penalidades da cláusula 6.</p>

      {esp ? (<>{cl(N.especiais, 'Condições especiais')}<p className="cdoc-pre">{x.especiais.trim()}</p></>) : null}

      {cl(N.gerais, 'Disposições gerais')}
      <p>{N.gerais}.1. Este contrato não cria vínculo de emprego entre o CONTRATANTE e o artista ou a equipe. Cada parte responde pelos tributos que lhe cabem.</p>
      <p>{N.gerais}.2. As partes aceitam a assinatura eletrônica deste contrato (Lei 14.063/2020), com a mesma validade da assinatura no papel.</p>

      {cl(N.foro, 'Foro')}
      <p>{N.foro}.1. Fica eleito o foro da comarca de Manaus/AM para resolver qualquer questão deste contrato.</p>

      <p className="cdoc-local"><F v={d.assinatura.cidade} rot="cidade" />, <F v={dataLonga(d.assinatura.data)} rot="data da assinatura" />.</p>

      <div className="cdoc-assinaturas">
        <div><span className="cdoc-linha" /><b>CONTRATADA</b><span>{empresa.representante}</span><span>{empresa.marca} · CNPJ {empresa.cnpj}</span></div>
        <div><span className="cdoc-linha" /><b>CONTRATANTE</b><span><F v={pj ? c.representante : c.nome} rot={pj ? 'representante' : 'nome'} /></span><span>{pj ? <><F v={c.nome} rot="razão social" /> · CNPJ <F v={c.doc} rot="CNPJ" /></> : <>CPF <F v={c.doc} rot="CPF" /></>}</span></div>
        <div><span className="cdoc-linha" /><b>TESTEMUNHA 1</b><span>Nome:</span><span>CPF:</span></div>
        <div><span className="cdoc-linha" /><b>TESTEMUNHA 2</b><span>Nome:</span><span>CPF:</span></div>
      </div>

      <section className="cdoc-anexo">
        <h3 className="cdoc-clausula">Anexo I · Rider de <F v={nomeArt} rot="artista" /></h3>
        {artista ? (
          <>
            <p className="cdoc-nota">Do material oficial do artista. Mudança no rider vale só com acordo por escrito.</p>
            <div className="cdoc-rider">
              {artista.rider.map((b) => (
                <div key={b.titulo}><h4>{b.titulo}</h4><ul className="cdoc-lista">{b.itens.map((i) => <li key={i}>{i}</li>)}</ul></div>
              ))}
            </div>
          </>
        ) : <p><mark className="cdoc-falta">[escolha o artista]</mark></p>}
      </section>
    </>
  );
}
