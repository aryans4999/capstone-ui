"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Calendar,
  FileText,
  Wrench,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  Download,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface RepairItem {
  damage: string;
  part_cost: number;
  part_name: string;
}

interface Claim {
  id: number;
  policy_number: string;
  claim_date: string;
  location: string;
  status: string;
  images: any; // Can be string or string[]
  repair: RepairItem[];
  damages: any; // Can be string or any[]
  created_at: string;
}

function ClaimTimeline({ claim }: { claim: Claim }) {
  const images = useMemo(() => {
    if (!claim.images) return [];
    if (typeof claim.images === "string") {
      try {
        return JSON.parse(claim.images);
      } catch (e) {
        return [];
      }
    }
    return claim.images;
  }, [claim.images]);

  const damages = useMemo(() => {
    if (!claim.damages) return [];
    if (typeof claim.damages === "string") {
      try {
        return JSON.parse(claim.damages);
      } catch (e) {
        return [];
      }
    }
    return claim.damages;
  }, [claim.damages]);

  const stages = [
    {
      id: "filed",
      label: "Claim Filed",
      description: `Reported on ${new Date(claim.created_at).toLocaleDateString()}`,
      status: "completed",
    },
    {
      id: "evidence",
      label: "Evidence Collected",
      description:
        images.length > 0
          ? `${images.length} photos provided`
          : "Waiting for evidence",
      status: images.length > 0 ? "completed" : "pending",
    },
    {
      id: "ai",
      label: "AI Assessment",
      description:
        Array.isArray(damages) &&
        damages.some((d) => d.source === "video_proof")
          ? "AI Video analysis complete"
          : Array.isArray(damages) && damages.length > 0
            ? "AI Image analysis complete"
            : "Analyzing damages...",
      status:
        Array.isArray(damages) && damages.length > 0 ? "completed" : "current",
    },
    {
      id: "review",
      label: "Expert Review",
      description:
        claim.status === "Approved" || claim.status === "Rejected"
          ? "Review complete"
          : "Pending manual verification",
      status:
        claim.status === "Approved" || claim.status === "Rejected"
          ? "completed"
          : claim.status === "In Review"
            ? "current"
            : "pending",
    },
    {
      id: "final",
      label: "Final Decision",
      description:
        claim.status === "Approved"
          ? "Claim Approved"
          : claim.status === "Rejected"
            ? "Claim Rejected"
            : "Awaiting final decision",
      status:
        claim.status === "Approved"
          ? "completed"
          : claim.status === "Rejected"
            ? "error"
            : "pending",
    },
  ];

  return (
    <div className="space-y-4 py-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        Processing Timeline
      </h4>
      <div className="relative space-y-4 left-2">
        {stages.map((stage, idx) => (
          <div key={stage.id} className="flex gap-4 relative group">
            {idx !== stages.length - 1 && (
              <div
                className={`absolute left-3 top-6 bottom-0 w-0.5 ${stage.status === "completed" ? "bg-green-500" : "bg-border"}`}
              />
            )}
            <div
              className={`relative flex items-center justify-center w-6 h-6 rounded-full shrink-0 z-10 ${
                stage.status === "completed"
                  ? "bg-green-100 text-green-600"
                  : stage.status === "current"
                    ? "bg-primary/20 text-primary animate-pulse"
                    : stage.status === "error"
                      ? "bg-red-100 text-red-600"
                      : "bg-muted text-muted-foreground"
              }`}
            >
              {stage.status === "completed" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : stage.status === "error" ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>
            <div className="pb-4">
              <p
                className={`text-sm font-medium ${stage.status === "current" ? "text-primary" : "text-foreground"}`}
              >
                {stage.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {stage.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClaimsList() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    const approved = claims.filter(
      (c) => c.status?.toLowerCase() === "approved",
    );
    const inReview = claims.filter(
      (c) =>
        c.status?.toLowerCase() === "in review" ||
        c.status?.toLowerCase() === "review",
    );
    const totalEst = claims.reduce(
      (sum, c) =>
        sum +
        (Array.isArray(c.repair)
          ? c.repair.reduce((s, r) => s + (r.part_cost || 0), 0)
          : 0),
      0,
    );

    return {
      total: claims.length,
      approved: approved.length,
      inReview: inReview.length,
      totalEst: totalEst,
    };
  }, [claims]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const { data, error } = await supabase
          .from("claims")
          .select("*")
          .eq("policy_number", "POL49999");

        if (error) {
          console.error("Error fetching claims:", error);
        } else {
          setClaims(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in review":
      case "review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getProgress = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return 100;
      case "in review":
      case "review":
        return 70;
      case "pending":
        return 30;
      default:
        return 10;
    }
  };

  const calculateTotalFromRepairs = (repair?: RepairItem[]) => {
    if (!repair || !Array.isArray(repair)) return 0;
    return repair.reduce((sum, item) => sum + (item.part_cost || 0), 0);
  };

  const formatCurrency = (amount: string | number | undefined) => {
    if (amount === undefined || amount === null || amount === "") return "₹0";
    if (
      typeof amount === "string" &&
      (amount.startsWith("$") || amount.startsWith("₹"))
    )
      return amount;
    const num = Number(amount);
    if (isNaN(num)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
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

  const getSummaryFromDamages = (damages: any) => {
    const parsed = parseJson(damages);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const summary = parsed[0]?.summary;
      if (summary && typeof summary === "object") {
        return Object.entries(summary)
          .map(([k, v]) => `${v} ${k}`)
          .join(", ");
      }
    }
    return "Car damage assessment in progress";
  };

  if (loading) {
    return <div className="text-center p-4">Loading claims...</div>;
  }

  if (claims.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No claims found.
      </div>
    );
  }

  const handlePrint = (claim: Claim) => {
    const uniqueName = new Date();
    const windowName = "Print" + uniqueName.getTime();
    const printWindow = window.open(
      "",
      windowName,
      "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0",
    );

    if (!printWindow) {
      toast.error(
        "Popup blocked! Please allow popups for this site to download the report.",
      );
      return;
    }

    const totalAmount = calculateTotalFromRepairs(claim.repair);
    const summaryText = getSummaryFromDamages(claim.damages);
    const imagesList = parseJson(claim.images);
    const damagesData = parseJson(claim.damages);
    const videoStats =
      Array.isArray(damagesData) && damagesData.length > 0
        ? damagesData[0].video_stats
        : null;

    printWindow?.document.write(`
        <html>
          <head>
            <title>Official Claim Report - CLM-${claim.id}</title>
            <style>
              @page { size: A4; margin: 0; }
              body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1a1a1a; margin: 0; padding: 0; background-color: #f3f4f6; }
              .page { background: white; width: 210mm; min-height: 297mm; padding: 20mm; margin: 10mm auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); position: relative; overflow: hidden; }
              .watermark { position: absolute; transform: rotate(-45deg); font-size: 80px; color: rgba(0,0,0,0.03); top: 30%; left: 0; width: 100%; text-align: center; pointer-events: none; white-space: nowrap; font-weight: bold; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
              .logo-area { display: flex; flex-direction: column; }
              .logo { font-size: 28px; font-weight: 800; color: #2563eb; letter-spacing: -1px; }
              .tagline { font-size: 12px; color: #64748b; font-weight: 500; }
              .report-type { font-size: 12px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
              .claim-id { font-size: 20px; font-weight: 700; color: #0f172a; }
              .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: #dcfce7; color: #166534; margin-top: 8px; }
              .info-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
              .info-item { display: flex; flex-direction: column; }
              .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
              .value { font-size: 14px; font-weight: 600; color: #0f172a; }
              .section { margin-bottom: 35px; }
              .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; border-left: 4px solid #2563eb; padding-left: 12px; }
              .section-title { font-size: 16px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
              .ai-summary { background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
              .stats-grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 15px; margin-top: 15px; }
              .stat-box { background: white; padding: 12px; border-radius: 8px; border: 1px solid #dbeafe; text-align: center; }
              .stat-val { font-size: 18px; font-weight: 700; color: #2563eb; }
              .stat-lbl { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
              th { text-align: left; background: #f8fafc; padding: 14px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
              td { padding: 14px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
              .total-row { background: #f8fafc; font-weight: 800; font-size: 16px; }
              .gallery { display: grid; grid-template-cols: repeat(4, 1fr); gap: 12px; margin-top: 15px; }
              .gallery-img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; }
              .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; }
              @media print { body { background: none; } .page { margin: 0; box-shadow: none; border: none; } }
            </style>
          </head>
          <body>
            <div class="page">
              <div class="watermark">AEVIOX AI VERIFIED</div>
              
              <div class="header">
                <div class="logo-area">
                  <div class="logo">Aeviox AI</div>
                  <div class="tagline">Next-Gen Insurance Intelligence</div>
                </div>
                <div style="text-align: right;">
                  <div class="report-type">Damage Assessment Report</div>
                  <div class="claim-id">#CLM-${claim.id.toString().padStart(4, "0")}</div>
                  <div class="status-badge">${claim.status}</div>
                </div>
              </div>
              
              <div class="info-grid">
                <div class="info-item">
                  <div class="label">Date Filed</div>
                  <div class="value">${claim.claim_date}</div>
                </div>
                <div class="info-item">
                  <div class="label">Policy Number</div>
                  <div class="value">${claim.policy_number}</div>
                </div>
                <div class="info-item">
                  <div class="label">Location</div>
                  <div class="value">${claim.location}</div>
                </div>
                <div class="info-item">
                  <div class="label">Assessed Value</div>
                  <div class="value" style="color: #2563eb;">₹${totalAmount.toLocaleString("en-IN")}</div>
                </div>
              </div>

              <div class="section">
                <div class="section-header">
                  <div class="section-title">AI Damage Assessment</div>
                </div>
                <div class="ai-summary">
                  <div style="font-weight: 600; color: #1e40af; font-size: 15px; margin-bottom: 8px;">Analysis Summary</div>
                  <div style="color: #3b82f6; font-size: 14px;">${summaryText}</div>
                  
                  ${
                    videoStats
                      ? `
                    <div class="stats-grid">
                      <div class="stat-box">
                        <div class="stat-val">${videoStats.frames}</div>
                        <div class="stat-lbl">Frames Processed</div>
                      </div>
                      <div class="stat-box">
                        <div class="stat-val">${videoStats.duration}s</div>
                        <div class="stat-lbl">Video Duration</div>
                      </div>
                      <div class="stat-box">
                        <div class="stat-val">${Math.round(videoStats.confidence * 100)}%</div>
                        <div class="stat-lbl">AI Confidence</div>
                      </div>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>

              <div class="section">
                <div class="section-header">
                  <div class="section-title">Evidence Gallery</div>
                </div>
                <div class="gallery">
                  ${
                    imagesList.length > 0
                      ? imagesList
                          .map(
                            (img: string) =>
                              `<img src="${img}" class="gallery-img" />`,
                          )
                          .join("")
                      : `<div style="grid-column: span 4; padding: 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; text-align: center; color: #64748b; font-size: 13px;">No photographic evidence attached</div>`
                  }
                </div>
                <p style="font-size: 10px; color: #94a3b8; margin-top: 8px; font-style: italic;">* Original images provided by the claimant.</p>
              </div>

              <div class="section">
                <div class="section-header">
                  <div class="section-title">Itemized Repair Estimates</div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Component / Part</th>
                      <th>Observed Damage</th>
                      <th style="text-align: right;">Estimated Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      (claim.repair || []).length > 0
                        ? (claim.repair || [])
                            .map(
                              (item) => `
                        <tr>
                          <td style="font-weight: 600;">${item.part_name}</td>
                          <td>${item.damage}</td>
                          <td style="text-align: right; color: #0f172a; font-weight: 600;">₹${(item.part_cost || 0).toLocaleString("en-IN")}</td>
                        </tr>
                      `,
                            )
                            .join("")
                        : `<tr><td colspan="3" style="text-align: center; color: #64748b; padding: 30px;">Detailed repair analysis pending.</td></tr>`
                    }
                    <tr class="total-row">
                      <td colspan="2" style="text-align: right;">Total Estimated Assessment</td>
                      <td style="text-align: right; color: #2563eb;">₹${totalAmount.toLocaleString("en-IN")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="footer">
                <p><strong>Confidential Document:</strong> This report is intended for insurance claim processing only.</p>
                <p>Generated by Aeviox AI Intelligence Systems on ${new Date().toLocaleString()} | ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                <div style="margin-top: 10px; font-weight: bold; color: #2563eb; font-size: 9px; text-transform: uppercase;">Verified by AI Damage Detection Engine v2.4</div>
              </div>
            </div>
            
            <script>
              window.onload = function() { 
                setTimeout(() => {
                  window.print(); 
                  // Close after print dialog is closed
                  window.onafterprint = function() { window.close(); };
                }, 500); 
              }
            </script>
          </body>
        </html>
      `);
    printWindow?.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Claims</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Review</p>
              <p className="text-xl font-bold">{stats.inReview}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-xl font-bold">{stats.approved}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IndianRupee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. Payout</p>
              <p className="text-xl font-bold">
                {formatCurrency(stats.totalEst)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {claims.map((claim) => {
          const totalAmount = calculateTotalFromRepairs(claim.repair);
          const imagesList = parseJson(claim.images);
          const summaryText = getSummaryFromDamages(claim.damages);
          const progress = getProgress(claim.status);

          return (
            <Card
              key={claim.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === claim.id ? null : claim.id)
                }
                className="w-full p-4 sm:p-6 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h3 className="font-semibold text-foreground uppercase">
                      CLM-{claim.id.toString().padStart(4, "0")}
                    </h3>
                    <Badge className={getStatusColor(claim.status)}>
                      {claim.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground truncate capitalize">
                    {summaryText}
                  </p>
                </div>
                <div className="ml-4 shrink-0">
                  {expandedId === claim.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedId === claim.id && (
                <div className="border-t border-border px-4 sm:px-6 py-6 bg-muted/30 space-y-6">
                  {/* Timeline and Details Grid */}
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Timeline */}
                    <div className="lg:col-span-1 border rounded-lg p-4 bg-background">
                      <ClaimTimeline claim={claim} />
                    </div>

                    {/* Claim Details */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">
                            Processing Progress
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2">
                          <div
                            className="bg-accent h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Claim Details Grid */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-medium">
                              Date Filed
                            </span>
                          </div>
                          <p className="text-foreground font-semibold">
                            {claim.claim_date}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-medium">
                              Location
                            </span>
                          </div>
                          <p className="text-foreground font-semibold">
                            {claim.location}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <IndianRupee className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-medium">
                              Claim Amount
                            </span>
                          </div>
                          <p className="text-foreground font-semibold text-lg">
                            {formatCurrency(totalAmount)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-medium">
                              Policy Number
                            </span>
                          </div>
                          <p className="text-foreground font-semibold">
                            {claim.policy_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Repairs Breakdown (if available) */}
                  {claim.repair &&
                    Array.isArray(claim.repair) &&
                    claim.repair.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-medium">
                            Estimated Repairs Breakdown
                          </span>
                        </div>
                        <div className="bg-background rounded-lg border border-border overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted text-muted-foreground border-b border-border">
                              <tr>
                                <th className="px-4 py-2 text-left font-medium">
                                  Part
                                </th>
                                <th className="px-4 py-2 text-left font-medium">
                                  Damage
                                </th>
                                <th className="px-4 py-2 text-right font-medium">
                                  Cost
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {claim.repair.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-muted/50 transition-colors"
                                >
                                  <td className="px-4 py-2 text-foreground font-medium">
                                    {item.part_name}
                                  </td>
                                  <td className="px-4 py-2 text-muted-foreground">
                                    {item.damage}
                                  </td>
                                  <td className="px-4 py-2 text-right text-foreground">
                                    {formatCurrency(item.part_cost)}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-muted/30 font-semibold">
                                <td
                                  colSpan={2}
                                  className="px-4 py-2 text-foreground"
                                >
                                  Total Estimated Cost
                                </td>
                                <td className="px-4 py-2 text-right text-foreground">
                                  {formatCurrency(totalAmount)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Images */}
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground font-medium">
                      Evidence Photos
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {imagesList.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img || "/placeholder.svg"}
                          alt={`Evidence ${idx + 1}`}
                          className="w-24 h-24 rounded-lg object-cover border border-border"
                        />
                      ))}
                      {imagesList.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                          No evidence attached.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrint(claim)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                    <Button size="sm" variant="outline">
                      Upload Documents
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
