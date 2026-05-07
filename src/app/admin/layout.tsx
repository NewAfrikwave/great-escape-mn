"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="lg:pl-64">
          <div className="pt-14 lg:pt-0">
            {children}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
