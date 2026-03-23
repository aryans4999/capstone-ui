export default function AdminUsersPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          View and manage registered users and their policies.
        </p>
      </div>
      <AdminUsersList />
    </div>
  );
}

import { AdminUsersList } from "@/components/admin/admin-users-list";
