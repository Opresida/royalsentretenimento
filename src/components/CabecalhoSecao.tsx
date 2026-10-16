import { Marcador } from './Marca';
import { Revela } from './Revela';

export function CabecalhoSecao({ olho, titulo, descricao, acao, nivel = 2 }: { olho?: string; titulo: string; descricao?: string; acao?: React.ReactNode; nivel?: 1 | 2 }) {
  const T = nivel === 1 ? 'h1' : 'h2';
  return (
    <Revela como="header" className="secao-cab">
      <div className="secao-cab__texto">
        <div className="secao-cab__olho"><Marcador />{olho && <span className="rotulo-texto">{olho}</span>}</div>
        <T className={nivel === 1 ? 'h1' : 'h2'}><span className="sobe"><span>{titulo}</span></span></T>
        {descricao && <p className="lead surge">{descricao}</p>}
      </div>
      {acao && <div className="surge">{acao}</div>}
    </Revela>
  );
}
