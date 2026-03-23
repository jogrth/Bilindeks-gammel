import { Container } from './ui/Container';
import { APP_NAME, APP_DOMAIN } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-20">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{APP_NAME}</h3>
            <p className="text-sm">
              Finn bilen som passer deg. Sammenlign biler basert på rekkevidde, bagasjerom, hengerfeste og pris.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Lenker</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Hjem
                </a>
              </li>
              <li>
                <a href="/cars" className="hover:text-white transition-colors">
                  Utforsk biler
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition-colors">
                  Admin Innlogging
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Kontakt</h4>
            <p className="text-sm">{APP_DOMAIN}</p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {currentYear} {APP_NAME}. Alle rettigheter reservert.</p>
        </div>
      </Container>
    </footer>
  );
}
