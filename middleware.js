import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isSignupPage = request.nextUrl.pathname === '/signup';
  const isPublicPage = isLoginPage || isSignupPage;

  // When offline, the client never even reaches the server for navigation
  // (service worker serves the app shell), so this check only governs
  // online navigations — offline sessions keep working from cached state.
  if (!session && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  if (session && isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_api|_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js).*)'],
};
