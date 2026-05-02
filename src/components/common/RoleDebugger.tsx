/**
 * Role Debugger Component
 * Shows current user's role and authentication status
 * Only visible in development mode
 */

import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const RoleDebugger = () => {
  // Only show in development
  if (!import.meta.env.DEV) return null;

  const { user, role, loading } = useAuth();

  const { data: rolesData } = useQuery({
    queryKey: ['debug-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      <div className="font-bold mb-2 text-yellow-400">🔧 DEV MODE - Role Debugger</div>
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">User ID:</span>{' '}
          <span className="text-green-400">{user?.id || 'Not logged in'}</span>
        </div>
        <div>
          <span className="text-gray-400">Email:</span>{' '}
          <span className="text-blue-400">{user?.email || 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-400">Current Role:</span>{' '}
          <span className="text-purple-400">{loading ? 'Loading...' : role || 'None'}</span>
        </div>
        <div>
          <span className="text-gray-400">DB Roles:</span>{' '}
          <span className="text-orange-400">
            {rolesData ? rolesData.map(r => r.role).join(', ') : 'Loading...'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Auth Status:</span>{' '}
          <span className={user ? 'text-green-400' : 'text-red-400'}>
            {user ? '✓ Authenticated' : '✗ Not authenticated'}
          </span>
        </div>
      </div>
    </div>
  );
};
