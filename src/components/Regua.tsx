/** Régua de informações do evento (Data · Local · Atração): fio na cor do evento em cima, fio neutro embaixo. */
export function Regua({ itens, grande }: { itens: { rotulo: string; valor: React.ReactNode; nota?: string }[]; grande?: boolean }) {
  return (
    <div className={`regua ${grande ? 'regua--lg' : ''}`}>
      {itens.map((it) => (
        <div className="regua__item" key={it.rotulo}>
          <span className="regua__rotulo">{it.rotulo}</span>
          <span className="regua__valor">{it.valor}</span>
          {it.nota && <span className="regua__nota">{it.nota}</span>}
        </div>
      ))}
    </div>
  );
}
