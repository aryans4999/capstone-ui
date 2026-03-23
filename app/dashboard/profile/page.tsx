import { UserProfile } from "@/components/dashboard/user-profile";
import { ProfileTabs } from "@/components/dashboard/profile-tabs";

export default function ProfilePage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <UserProfile />
      <ProfileTabs />
    </div>
  );
}
