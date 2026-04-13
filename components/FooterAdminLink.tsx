'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function FooterAdminLink() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  return (
    <a
      href={isLoggedIn ? '/admin' : '/login'}
      className="hover:text-white transition-colors"
    >
      Admin
    </a>
  );
}
