import Link from 'next/link';
import { INSTAGRAM_URL, PERFIL } from '@/lib/acervo';
import { Logo } from './Marca';

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="container">
        <div className="rodape__grade">
          <div className="rodape__col rodape__logo"><Logo largura={160} brilho /></div>
          <div className="rodape__col">
            <span className="rotulo-texto">Eventos</span>
            <Link href="/eventos">Próximos eventos</Link>
            <Link href="/relembre-momentos">Relembre momentos</Link>
            <Link href="/melhores-momentos">Melhores momentos</Link>
          </div>
          <div className="rodape__col">
            <span className="rotulo-texto">Royals</span>
            <Link href="/sobre">Sobre</Link>
            <Link href="/promoters">Promoters</Link>
            <Link href="/contato">Contato</Link>
          </div>
          <div className="rodape__col">
            <span className="rotulo-texto">Redes</span>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram · @{PERFIL.usuario} ↗</a>
          </div>
        </div>
        <div className="rodape__legal">
          <span>© {new Date().getFullYear()} Royals Entretenimento · Manaus, AM</span>
          <span><Link href="/privacidade">Privacidade</Link> · <Link href="/termos">Termos</Link></span>
        </div>
      </div>
    </footer>
  );
}
