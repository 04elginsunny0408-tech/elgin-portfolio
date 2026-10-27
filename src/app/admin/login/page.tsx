import React from 'react';
import { getOwnerCount, verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || '';
  const auth = verifySession(token);

  // If already authenticated, redirect to dashboard directly
  if (auth.isValid) {
    redirect('/admin');
  }

  const isInitialSetup = getOwnerCount() === 0;

  return <LoginClient isInitialSetup={isInitialSetup} />;
}
