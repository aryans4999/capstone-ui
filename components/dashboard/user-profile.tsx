"use client";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Phone, MapPin, FileCheck, Car } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function UserProfile() {
  const { user } = useUser();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", user?.id)
        .single();
      if (!error) setData(data);
    };
    fetchProfileData();
  }, [user]);

  return (
    <Card className="p-6 sm:p-8">
      <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
            <UserCircle className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">{data?.name}</p>
            <Badge variant="outline" className="mt-2">
              Active Member
            </Badge>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Name */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">
              Vehicle Name
            </p>
            <p className="text-foreground font-semibold">
              {data?.vehicle_name}
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">Phone</p>
            </div>
            <p className="text-foreground font-semibold">{data?.phone}</p>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">
                Location
              </p>
            </div>
            <p className="text-foreground font-semibold">{data?.address}</p>
          </div>

          {/* Policy Number */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">
                Policy Number
              </p>
            </div>
            <p className="text-foreground font-semibold font-mono text-sm">
              {data?.policy_number}
            </p>
          </div>

          {/* Registration Number */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">
              Registration
            </p>
            <p className="text-foreground font-semibold font-mono text-sm">
              {data?.vehicle_registration}
            </p>
          </div>

          {/* Vehicle */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">
                Vehicle
              </p>
            </div>
            <p className="text-foreground font-semibold">
              {data?.number_plate}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
