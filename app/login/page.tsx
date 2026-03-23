'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting sign in...');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        setError('Feil e-post eller passord');
        setLoading(false);
        return;
      }

      console.log('Sign in successful');
      console.log('Session exists:', !!data.session);
      console.log('Access token exists:', !!data.session?.access_token);
      console.log('User ID:', data.user?.id);

      if (data.user && data.session) {
        // Verify admin status using Edge Function
        const verifyUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-admin`;
        console.log('Calling verify-admin at:', verifyUrl);
        console.log('With token:', data.session.access_token.substring(0, 20) + '...');

        try {
          const verifyResponse = await fetch(verifyUrl, {
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('Verify response status:', verifyResponse.status);

          if (!verifyResponse.ok) {
            const errorText = await verifyResponse.text();
            console.error('Verify response error:', errorText);
            await supabase.auth.signOut();
            setError(`Kunne ikke verifisere admin-tilgang: ${verifyResponse.status}`);
            setLoading(false);
            return;
          }

          const result = await verifyResponse.json();

          if (!result.isAdmin) {
            await supabase.auth.signOut();
            setError('Du har ikke admin-tilgang');
            setLoading(false);
            return;
          }

          router.push('/admin');
          router.refresh();
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          await supabase.auth.signOut();
          setError('Nettverksfeil ved verifisering av admin-tilgang');
          setLoading(false);
        }
      }
    } catch (err) {
      setError('Noe gikk galt. Prøv igjen.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Container className="max-w-md w-full">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Innlogging</h1>
            <p className="text-gray-600">Logg inn for å administrere Biljakt</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-post
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="din@epost.no"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Passord
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Logger inn...' : 'Logg inn'}
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
}
