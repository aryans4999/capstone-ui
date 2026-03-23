"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Video as VideoIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VideoDetectionResponse {
  total_unique_damages: number;
  damage_counts_per_class: Record<string, number>;
  total_frames_processed: number;
  video_duration_seconds: number;
  confidence_threshold: number;
  annotated_video_base64: string;
}

interface Claim {
  id: number;
  status: string;
  policy_number: string;
}

export default function VideoProofPage() {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [annotatedVideoUrl, setAnnotatedVideoUrl] = useState<string | null>(
    null,
  );
  const [detectionResults, setDetectionResults] =
    useState<VideoDetectionResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string>("");
  const [isUpdatingClaim, setIsUpdatingClaim] = useState(false);

  useEffect(() => {
    async function fetchClaims() {
      try {
        const { data, error } = await supabase
          .from("claims")
          .select("id, status, policy_number")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setClaims(data || []);
      } catch (error) {
        console.error("Error fetching claims:", error);
        toast.error("Failed to load claims");
      }
    }

    fetchClaims();
  }, []);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        return;
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        toast.error("Video file size must be less than 100MB");
        return;
      }

      setSelectedVideo(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      setDetectionResults(null); // Clear previous results
      toast.success("Video selected successfully");
    }
  };

  const handleSubmit = async () => {
    if (!selectedClaimId) {
      toast.error("Please select a claim to attach this proof to");
      return;
    }

    if (!selectedVideo) {
      toast.error("Please select a video file first");
      return;
    }

    setIsProcessing(true);

    try {
      // Create FormData to send video file
      const formData = new FormData();
      formData.append("video", selectedVideo);
      formData.append("confidence_threshold", confidenceThreshold.toString());

      // Call the video detection API
      const response = await fetch("http://localhost:8000/detect/video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to process video");
      }

      const results: VideoDetectionResponse = await response.json();
      console.log("API Response:", results);
      console.log("Has annotated video:", !!results.annotated_video_base64);
      console.log(
        "Annotated video length:",
        results.annotated_video_base64?.length,
      );
      setDetectionResults(results);

      // Create Object URL for annotated video
      if (results.annotated_video_base64) {
        try {
          const byteCharacters = atob(results.annotated_video_base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "video/mp4" });
          const url = URL.createObjectURL(blob);
          setAnnotatedVideoUrl(url);
        } catch (e) {
          console.error("Error creating video blob:", e);
        }
      }

      toast.success(
        `Video processed successfully! Found ${results.total_unique_damages} unique damages.`,
      );

      // Automatically update the claim with results
      await updateClaimWithResults(results);
    } catch (error) {
      console.error("Error processing video:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process video",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const updateClaimWithResults = async (results: VideoDetectionResponse) => {
    if (!selectedClaimId) return;

    setIsUpdatingClaim(true);
    try {
      // Prepare damage summary object
      const summary: Record<string, number> = results.damage_counts_per_class;

      const newDamageEntry = {
        timestamp: new Date().toISOString(),
        source: "video_proof",
        total_unique_damages: results.total_unique_damages,
        summary: summary,
        video_stats: {
          duration: results.video_duration_seconds,
          frames: results.total_frames_processed,
          confidence: results.confidence_threshold,
        },
      };

      // Fetch existing damages
      const { data: claimData, error: fetchError } = await supabase
        .from("claims")
        .select("damages")
        .eq("id", selectedClaimId)
        .single();

      if (fetchError) throw fetchError;

      let currentDamages = [];
      if (claimData.damages) {
        try {
          currentDamages =
            typeof claimData.damages === "string"
              ? JSON.parse(claimData.damages)
              : claimData.damages;
          if (!Array.isArray(currentDamages)) currentDamages = [currentDamages];
        } catch (e) {
          currentDamages = [];
        }
      }

      const updatedDamages = [newDamageEntry, ...currentDamages];

      const { error: updateError } = await supabase
        .from("claims")
        .update({
          damages: updatedDamages,
          status: "In Review", // Automatically move to in review when proof is added
        })
        .eq("id", selectedClaimId);

      if (updateError) throw updateError;

      toast.success("Claim updated with video proof results");
    } catch (error) {
      console.error("Error updating claim:", error);
      toast.error("Failed to update claim details");
    } finally {
      setIsUpdatingClaim(false);
    }
  };

  const handleClear = () => {
    setSelectedVideo(null);
    setDetectionResults(null);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    if (annotatedVideoUrl) {
      URL.revokeObjectURL(annotatedVideoUrl);
      setAnnotatedVideoUrl(null);
    }
  };

  const handleDownloadAnnotatedVideo = () => {
    if (!detectionResults?.annotated_video_base64) return;

    const link = document.createElement("a");
    link.href = `data:video/mp4;base64,${detectionResults.annotated_video_base64}`;
    link.download = `annotated_${selectedVideo?.name || "video.mp4"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Annotated video downloaded successfully");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Video Proof Submission
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload video evidence to support your insurance claim and detect
          vehicle damage automatically
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoIcon className="w-5 h-5" />
            Upload Video
          </CardTitle>
          <CardDescription>
            Select a video file from your device. Supported formats: MP4, MOV,
            AVI, WebM (Max size: 100MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="claim-select">Select Claim</Label>
            <Select
              value={selectedClaimId}
              onValueChange={setSelectedClaimId}
              disabled={isProcessing}
            >
              <SelectTrigger id="claim-select">
                <SelectValue placeholder="Which claim is this proof for?" />
              </SelectTrigger>
              <SelectContent>
                {claims.map((claim) => (
                  <SelectItem key={claim.id} value={claim.id.toString()}>
                    CLM-{claim.id.toString().padStart(4, "0")} ({claim.status})
                    - {claim.policy_number}
                  </SelectItem>
                ))}
                {claims.length === 0 && (
                  <SelectItem value="none" disabled>
                    No claims found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The video proof will be analyzed and results will be attached to
              the selected claim.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-upload">Video File</Label>
            <div className="flex items-center gap-4">
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="cursor-pointer"
                disabled={isProcessing}
              />
              {selectedVideo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={isProcessing}
                >
                  Clear
                </Button>
              )}
            </div>
            {selectedVideo && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedVideo.name} (
                {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confidence-threshold">
              Confidence Threshold: {confidenceThreshold.toFixed(2)}
            </Label>
            <Input
              id="confidence-threshold"
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) =>
                setConfidenceThreshold(parseFloat(e.target.value))
              }
              disabled={isProcessing}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Higher values = more strict detection (fewer false positives)
            </p>
          </div>

          {videoPreviewUrl && (
            <div className="space-y-2">
              <Label>Video Preview</Label>
              <div className="rounded-lg border bg-muted/50 p-4">
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full max-h-[500px] rounded-md"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!selectedVideo || isProcessing}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isProcessing || isUpdatingClaim
                ? "Processing..."
                : "Analyze & Attach to Claim"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {detectionResults && detectionResults.annotated_video_base64 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-blue-600" />
              Annotated Video Output
            </CardTitle>
            <CardDescription>
              Processed video with bounding boxes and damage labels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Original Video */}
              {videoPreviewUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Original Video
                  </Label>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full rounded-md"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {/* Annotated Video */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Annotated Video (with Detections)
                </Label>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <video
                    src={annotatedVideoUrl || ""}
                    controls
                    className="w-full rounded-md"
                    onError={(e) => {
                      console.error("Video load error:", e);
                      toast.error("Failed to load annotated video");
                    }}
                    onLoadedData={() => {
                      console.log("Annotated video loaded successfully");
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDownloadAnnotatedVideo}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Download Annotated Video
            </Button>
          </CardContent>
        </Card>
      )}

      {detectionResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Detection Results
            </CardTitle>
            <CardDescription>
              AI-powered damage detection analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Alert */}
            <Alert
              className={
                detectionResults.total_unique_damages > 0
                  ? "border-orange-500"
                  : "border-green-500"
              }
            >
              <AlertCircle
                className={
                  detectionResults.total_unique_damages > 0
                    ? "text-orange-600"
                    : "text-green-600"
                }
              />
              <AlertTitle>
                {detectionResults.total_unique_damages > 0
                  ? `${detectionResults.total_unique_damages} Unique Damage${detectionResults.total_unique_damages !== 1 ? "s" : ""} Detected`
                  : "No Damage Detected"}
              </AlertTitle>
              <AlertDescription>
                {detectionResults.total_unique_damages > 0
                  ? "The AI system has identified vehicle damage in your video. Review the breakdown below."
                  : "The AI system did not detect any vehicle damage in your video."}
              </AlertDescription>
            </Alert>

            {/* Damage Breakdown */}
            {detectionResults.total_unique_damages > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Damage Breakdown by Type
                </Label>
                <div className="grid gap-3">
                  {Object.entries(detectionResults.damage_counts_per_class).map(
                    ([damageType, count]) => (
                      <div
                        key={damageType}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                      >
                        <span className="font-medium capitalize">
                          {damageType.replace(/_/g, " ")}
                        </span>
                        <span className="text-lg font-bold text-orange-600">
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Video Processing Stats */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Processing Statistics
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    Frames Processed
                  </p>
                  <p className="text-xl font-bold">
                    {detectionResults.total_frames_processed}
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    Video Duration
                  </p>
                  <p className="text-xl font-bold">
                    {detectionResults.video_duration_seconds.toFixed(1)}s
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    Confidence Used
                  </p>
                  <p className="text-xl font-bold">
                    {(detectionResults.confidence_threshold * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">FPS</p>
                  <p className="text-xl font-bold">
                    {(
                      detectionResults.total_frames_processed /
                      detectionResults.video_duration_seconds
                    ).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
