import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
  isAdmin: boolean;
}

export const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    
    // Get all users from auth metadata
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching users:', authError);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Get admin roles
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    }

    const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);

    const usersWithRoles = authUsers.users.map(user => ({
      id: user.id,
      email: user.email || 'No email',
      created_at: user.created_at,
      isAdmin: adminUserIds.has(user.id),
    }));

    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdminRole = async (userId: string, currentlyAdmin: boolean) => {
    setProcessingUserId(userId);

    if (currentlyAdmin) {
      // Remove admin role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove admin role",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Admin role removed",
        });
        fetchUsers();
      }
    } else {
      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add admin role",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Admin role added",
        });
        fetchUsers();
      }
    }

    setProcessingUserId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">User Management</h2>
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  Joined: {new Date(user.created_at).toLocaleDateString()}
                </p>
                {user.isAdmin && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                    Admin
                  </span>
                )}
              </div>
              <Button
                variant={user.isAdmin ? "destructive" : "default"}
                size="sm"
                onClick={() => toggleAdminRole(user.id, user.isAdmin)}
                disabled={processingUserId === user.id}
              >
                {processingUserId === user.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : user.isAdmin ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Remove Admin
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Make Admin
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
