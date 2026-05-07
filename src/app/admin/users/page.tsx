"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  Plus,
  Loader2,
  User,
  Mail,
  Crown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AdminUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddUserForm {
  name: string;
  email: string;
  password: string;
  role: string;
}

const emptyForm: AddUserForm = {
  name: "",
  email: "",
  password: "",
  role: "admin",
};

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Crown; className: string }> = {
  owner: {
    label: "Owner",
    icon: Crown,
    className: "bg-[#c8993e]/10 text-[#c8993e] border-[#c8993e]/20",
  },
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    className: "bg-[#1a2744]/10 text-[#1a2744] border-[#1a2744]/20",
  },
  editor: {
    label: "Editor",
    icon: User,
    className: "bg-[#2d5a3d]/10 text-[#2d5a3d] border-[#2d5a3d]/20",
  },
};

function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] ?? {
    label: role,
    icon: User,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 text-xs ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [form, setForm] = useState<AddUserForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: AdminUserData[] = await res.json();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setUsers((prev) => [data, ...prev]);
      setAddDialogOpen(false);
      setForm(emptyForm);
      toast.success(`User "${form.name}" created successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-[#1a2744]" />
          <div>
            <h1 className="text-2xl font-bold text-[#1a2744]">Admin Users</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              User management is limited in V1
            </p>
          </div>
          <Badge className="bg-[#1a2744] text-white hover:bg-[#1a2744]">
            {users.length}
          </Badge>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setAddDialogOpen(true);
          }}
          className="gap-2 bg-[#1a2744] hover:bg-[#2a3d64]"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No admin users</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add an admin user to manage the site.
            </p>
            <Button
              onClick={() => setAddDialogOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-[#1a2744]">
              <User className="h-4 w-4" />
              {users.length} Admin {users.length === 1 ? "User" : "Users"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Name
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Email
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Role
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left font-medium px-4 py-3 whitespace-nowrap">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-[#1a2744]/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-[#1a2744]">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          {user.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="max-w-[200px] truncate">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {user.isActive ? (
                          <Badge
                            variant="outline"
                            className="gap-1 text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1 text-xs bg-red-50 text-red-700 border-red-200"
                          >
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#1a2744]" />
              Add Admin User
            </DialogTitle>
            <DialogDescription>
              Create a new admin user. The password will be securely hashed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="user-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="user-password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Minimum 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, role: val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">
                    <span className="flex items-center gap-2">
                      <Crown className="h-3.5 w-3.5 text-[#c8993e]" />
                      Owner
                    </span>
                  </SelectItem>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#1a2744]" />
                      Admin
                    </span>
                  </SelectItem>
                  <SelectItem value="editor">
                    <span className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-[#2d5a3d]" />
                      Editor
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                <strong>Owner:</strong> Full access including user management.{" "}
                <strong>Admin:</strong> Full content and settings access.{" "}
                <strong>Editor:</strong> Content editing only.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={saving}
              className="gap-2 bg-[#1a2744] hover:bg-[#2a3d64]"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {saving ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
