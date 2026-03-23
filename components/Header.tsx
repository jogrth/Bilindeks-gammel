import Link from 'next/link';
import { Container } from './ui/Container';
import { APP_NAME } from '@/lib/constants';

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <Container>
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary-700">{APP_NAME}</div>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              href="/cars"
              className="text-slate-700 hover:text-primary-700 font-medium transition-colors"
            >
              Utforsk biler
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
