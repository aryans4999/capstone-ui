export default function AdminClaimsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Claims Management</h1>
        <p className="text-muted-foreground">
          Inspect, review, and update insurance claims.
        </p>
      </div>
      <AdminClaimsList />
    </div>
  );
}

import { AdminClaimsList } from "@/components/admin/admin-claims-list";
