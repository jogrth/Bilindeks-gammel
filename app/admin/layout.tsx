import { requireAdmin } from '@/lib/auth/helpers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
