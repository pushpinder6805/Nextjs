import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/api/auth';

export function protectRoute() {
  // Check if user is authenticated client-side
  const isAuth = isAuthenticated();
  
  if (!isAuth) {
    redirect('/auth/login');
  }
  
  return true;
}

export function withAuth(Component: any) {
  return function AuthProtected(props: any) {
    // This will run on the client side only
    protectRoute();
    
    return Component(props);
  };
} 