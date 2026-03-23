"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface RepairItem {
  part_name: string;
  damage: string;
  part_cost: number;
}

export default function AdminClaimDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const claimId = resolvedParams.id;
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Editable local state
  const [location, setLocation] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [claimDate, setClaimDate] = useState("");
  const [repairs, setRepairs] = useState<RepairItem[]>([]);

  async function fetchClaim() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("claims")
        .select("*")
        .eq("id", claimId)
        .single();

      if (error) {
        toast.error("Failed to load claim details");
        console.error(error);
      } else {
        setClaim(data);
        setLocation(data.location || "");
        setPolicyNumber(data.policy_number || "");
        setClaimDate(data.claim_date || "");
        setRepairs(data.repair || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (claimId) {
      fetchClaim();
    }
  }, [claimId]);

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("claims")
        .update({ status: newStatus })
        .eq("id", claimId);

      if (error) throw error;

      setClaim({ ...claim, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const { error } = await supabase
        .from("claims")
        .update({
          location,
          policy_number: policyNumber,
          claim_date: claimDate,
          repair: repairs,
        })
        .eq("id", claimId);

      if (error) throw error;

      setClaim({
        ...claim,
        location,
        policy_number: policyNumber,
        claim_date: claimDate,
        repair: repairs,
      });
      setIsEditing(false);
      toast.success("Claim details updated successfully");
    } catch (error) {
      console.error("Error saving claim:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaveLoading(false);
    }
  };

  const addRepairItem = () => {
    setRepairs([...repairs, { part_name: "", damage: "", part_cost: 0 }]);
  };

  const removeRepairItem = (index: number) => {
    setRepairs(repairs.filter((_, i) => i !== index));
  };

  const updateRepairItem = (
    index: number,
    field: keyof RepairItem,
    value: any,
  ) => {
    const newRepairs = [...repairs];
    newRepairs[index] = { ...newRepairs[index], [field]: value };
    setRepairs(newRepairs);
  };

  const parseJson = (val: any) => {
    if (!val) return [];
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch (e) {
        return [];
      }
    }
    return val;
  };

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading claim details...
      </div>
    );
  if (!claim)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Claim not found
      </div>
    );

  const images = parseJson(claim.images);
  let damages = parseJson(claim.damages);

  const totalCost = repairs.reduce(
    (acc: number, item: any) => acc + (Number(item.part_cost) || 0),
    0,
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/dashboard/claims">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Claim #{claim.id}
            </h1>
            <p className="text-muted-foreground text-sm">
              Policy: {claim.policy_number}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  // Reset to original data
                  setLocation(claim.location || "");
                  setPolicyNumber(claim.policy_number || "");
                  setClaimDate(claim.claim_date || "");
                  setRepairs(claim.repair || []);
                }}
                disabled={saveLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Claim
              </Button>
              <Select value={claim.status} onValueChange={updateStatus}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Assessment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evidence Photos</CardTitle>
            </CardHeader>
            <CardContent>
              {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((img: string, idx: number) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative aspect-video rounded-lg overflow-hidden border bg-muted group"
                    >
                      <img
                        src={img}
                        alt={`Evidence ${idx}`}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm italic py-4">
                  No images provided.
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Assessment */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                AI Assessment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {damages ? (
                Array.isArray(damages) ? (
                  <div className="space-y-4">
                    {damages.map((dmg: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-background rounded-lg border p-4 shadow-sm"
                      >
                        {dmg.summary && (
                          <div className="mb-3 border-b pb-2">
                            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">
                              Impact Summary
                            </h4>
                            <div className="flex flex-wrap gap-2 text-sm">
                              {Object.entries(dmg.summary).map(
                                ([part, condition]: any) => (
                                  <Badge
                                    key={part}
                                    variant="outline"
                                    className="text-foreground"
                                  >
                                    {part}:{" "}
                                    <span className="font-normal text-muted-foreground ml-1">
                                      {condition}
                                    </span>
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="raw-json" className="border-0">
                            <AccordionTrigger className="text-sm text-muted-foreground py-0 hover:no-underline hover:text-foreground">
                              View Full Analysis Data
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="bg-muted p-2 rounded mt-2 font-mono text-xs overflow-x-auto">
                                <pre>{JSON.stringify(dmg, null, 2)}</pre>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-background rounded-lg border p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(damages, null, 2)}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 opacity-50 mb-2" />
                  <p>No AI assessment data available for this claim.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Repair Estimates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Repair Estimates</CardTitle>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-primary">
                  {totalCost.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  })}
                </span>
                {isEditing && (
                  <Button size="sm" variant="outline" onClick={addRepairItem}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Part</th>
                      <th className="px-4 py-3 text-left font-medium">
                        Damage
                      </th>
                      <th className="px-4 py-3 text-right font-medium w-32">
                        Cost
                      </th>
                      {isEditing && (
                        <th className="px-4 py-3 text-center w-12"></th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {repairs.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <Input
                              value={item.part_name}
                              onChange={(e) =>
                                updateRepairItem(
                                  idx,
                                  "part_name",
                                  e.target.value,
                                )
                              }
                              className="h-8 text-sm"
                              placeholder="Part Name"
                            />
                          ) : (
                            <span className="font-medium">
                              {item.part_name}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <Input
                              value={item.damage}
                              onChange={(e) =>
                                updateRepairItem(idx, "damage", e.target.value)
                              }
                              className="h-8 text-sm"
                              placeholder="Damage Details"
                            />
                          ) : (
                            <span className="text-muted-foreground">
                              {item.damage}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={item.part_cost}
                              onChange={(e) =>
                                updateRepairItem(
                                  idx,
                                  "part_cost",
                                  Number(e.target.value),
                                )
                              }
                              className="h-8 text-sm text-right"
                              placeholder="0"
                            />
                          ) : (
                            Number(item.part_cost).toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            })
                          )}
                        </td>
                        {isEditing && (
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeRepairItem(idx)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {repairs.length === 0 && (
                      <tr>
                        <td
                          colSpan={isEditing ? 4 : 3}
                          className="px-4 py-6 text-center text-muted-foreground"
                        >
                          No repair items listed.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Meta Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Claim Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="w-full">
                  <p className="text-sm font-medium text-foreground">
                    Date Filed
                  </p>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={claimDate}
                      onChange={(e) => setClaimDate(e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {claimDate
                        ? new Date(claimDate).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="w-full">
                  <p className="text-sm font-medium text-foreground">
                    Location
                  </p>
                  {isEditing ? (
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-8 text-sm mt-1"
                      placeholder="e.g. Mumbai, India"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {location || "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="w-full">
                  <p className="text-sm font-medium text-foreground">
                    Policy Number
                  </p>
                  {isEditing ? (
                    <Input
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      className="h-8 text-sm mt-1 font-mono"
                      placeholder="Policy ID"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground font-mono">
                      {policyNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    System Created
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(claim.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  User ID:{" "}
                  <span className="font-mono text-xs">
                    {claim.user_id || "Anonymous"}
                  </span>
                </p>
                <Link
                  href="/admin/dashboard/users"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View User Database{" "}
                  <ArrowLeft className="w-3 h-3 rotate-180" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
