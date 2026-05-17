"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>
      <div data-admin-shell className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="lg:pl-64">
          <div className="pt-16 pb-24 lg:pt-0 lg:pb-0">
            {children}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
