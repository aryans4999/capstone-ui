"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Search,
  UserCircle,
  Phone,
  MapPin,
  FileCheck,
  Car,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  id: string; // uuid from auth, but mainly referencing public.users table items
  user_id: string;
  name: string;
  email?: string; // If in table
  phone: string;
  address: string;
  policy_number: string;
  vehicle_name: string;
  vehicle_registration: string;
  number_plate: string;
  created_at: string;
}

export function AdminUsersList() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      } else {
        let filteredData = (data as UserProfile[]) || [];
        if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          filteredData = filteredData.filter(
            (u) =>
              u.name?.toLowerCase().includes(lowerTerm) ||
              u.policy_number?.toLowerCase().includes(lowerTerm) ||
              u.phone?.includes(searchTerm),
          );
        }
        setUsers(filteredData);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const handleRowClick = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData(user);
    setIsEditingUser(false);
    setIsDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setSaveLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          policy_number: formData.policy_number,
          vehicle_name: formData.vehicle_name,
          vehicle_registration: formData.vehicle_registration,
          number_plate: formData.number_plate,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast.success("User profile updated successfully");
      setIsEditingUser(false);
      fetchUsers(); // Refresh the list
      // Update selected user for the dialog view
      setSelectedUser({ ...selectedUser, ...formData } as UserProfile);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user profile");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search name, policy, phone..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Policy Number</TableHead>
              <TableHead className="text-right">Vehicle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center h-24 text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id || user.user_id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(user)}
                >
                  <TableCell className="font-medium flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-muted-foreground" />
                    {user.name || "N/A"}
                  </TableCell>
                  <TableCell>{user.phone || "N/A"}</TableCell>
                  <TableCell>{user.policy_number || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    {user.vehicle_name || "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedUser && (
            <>
              <DialogHeader className="flex flex-row items-center justify-between pr-8">
                <DialogTitle>User Profile</DialogTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingUser(!isEditingUser)}
                  disabled={saveLoading}
                >
                  {isEditingUser ? "Cancel Edit" : "Edit Profile"}
                </Button>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="flex flex-col items-center gap-3 pb-6 border-b">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="w-12 h-12 text-primary" />
                  </div>
                  <div className="text-center w-full max-w-sm px-4">
                    {isEditingUser ? (
                      <Input
                        value={formData.name || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="text-center font-semibold text-lg"
                        placeholder="User Name"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold">
                        {selectedUser.name}
                      </h3>
                    )}
                    <Badge variant="outline" className="mt-1">
                      Active User
                    </Badge>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Phone
                      </span>
                    </div>
                    {isEditingUser ? (
                      <Input
                        value={formData.phone || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-semibold">{selectedUser.phone}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Location
                      </span>
                    </div>
                    {isEditingUser ? (
                      <Input
                        value={formData.address || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-semibold">{selectedUser.address}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Policy
                      </span>
                    </div>
                    {isEditingUser ? (
                      <Input
                        value={formData.policy_number || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            policy_number: e.target.value,
                          })
                        }
                        className="font-mono"
                      />
                    ) : (
                      <p className="font-semibold font-mono">
                        {selectedUser.policy_number}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Vehicle Name
                      </span>
                    </div>
                    {isEditingUser ? (
                      <Input
                        value={formData.vehicle_name || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicle_name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="font-semibold">
                        {selectedUser.vehicle_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Number Plate
                      </span>
                    </div>
                    {isEditingUser ? (
                      <Input
                        value={formData.number_plate || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            number_plate: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="font-semibold">
                        {selectedUser.number_plate}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Registration
                      </span>
                    </div>
                    {isEditingUser ? (
                      <Input
                        value={formData.vehicle_registration || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicle_registration: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="font-semibold">
                        {selectedUser.vehicle_registration}
                      </p>
                    )}
                  </div>
                </div>

                {isEditingUser && (
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingUser(false)}
                      disabled={saveLoading}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateUser} disabled={saveLoading}>
                      {saveLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
