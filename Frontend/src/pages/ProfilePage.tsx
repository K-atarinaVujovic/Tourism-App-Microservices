import { Link, useParams } from "react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { useProfile, useUpdateProfile } from "@/features/stakeholders/hooks/useProfile";
import { updateProfileSchema, type UpdateProfileFormValues } from "@/lib/schemas";
import { useImageUpload } from "@hooks/useImageUpload";
import { uploadProfileImage } from "@/features/stakeholders/services/stakeholdersService";
import { useFollowUser, useUnfollowUser, useIsFollowing } from "@/features/followers/hooks/useFollower";
import RecommendedProfiles from "@/features/followers/components/ReccommendedProfiles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Camera, Quote, Info, UserCheck, UserPlus, AlertCircle, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const parsedUserId = Number(userId);

  const { user } = useAuthStore();
  const isOwner = user?.id === parsedUserId;

  const { data: following } = useIsFollowing(parsedUserId);
  const { mutate: follow } = useFollowUser(parsedUserId);
  const { mutate: unfollow } = useUnfollowUser(parsedUserId);

  const { data: profile, isLoading, isError } = useProfile(parsedUserId);
  const { mutate: updateProfile, isPending } = useUpdateProfile(parsedUserId);

  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { upload, isUploading } = useImageUpload(uploadProfileImage);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    values: profile
      ? {
          name: profile.name,
          lastname: profile.lastname,
          imageUrl: profile.imageUrl,
          biography: profile.biography,
          quote: profile.quote,
        }
      : undefined,
  });

  useEffect(() => {
    if (profile?.imageUrl) setPreviewUrl(profile.imageUrl);
  }, [profile?.imageUrl]);

  if (isLoading) return <div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (isError || !profile) return (
    <div className="container mx-auto p-12 text-center border-2 border-dashed rounded-xl flex flex-col items-center gap-3 mt-10">
      <AlertCircle className="h-10 w-10 text-destructive opacity-50" />
      <p className="text-destructive font-medium">Failed to load profile.</p>
    </div>
  );

  async function onSubmit(values: UpdateProfileFormValues) {
    let imageUrl = values.imageUrl;

    if (pendingFile) {
      const uploaded = await upload(pendingFile);
      if (!uploaded) return;
      imageUrl = uploaded;
      setValue("imageUrl", imageUrl);
    }

    updateProfile(
      { ...values, imageUrl, user_id: parsedUserId },
      {
        onSuccess: () => {
          setIsEditing(false);
          setPendingFile(null);
        },
      }
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8 mt-4">
      <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-background to-muted/30">
        <div className="h-32 bg-primary/10 relative">
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 sm:left-12 sm:translate-x-0">
            <div className="relative group">
              <img
                src={previewUrl || profile.imageUrl || "/icons.svg#user-icon"}
                alt="Profile"
                className="size-32 rounded-full border-4 border-background object-cover bg-muted shadow-lg transition-transform group-hover:scale-105"
              />
              {isEditing && (
                <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white h-8 w-8" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setPendingFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="pt-20 px-8 pb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight">{profile.name} {profile.lastname}</h1>
                <Badge variant="secondary" className="w-fit mx-auto sm:mx-0 capitalize font-bold text-xs">
                  {profile.role}
                </Badge>
              </div>
              <div className="flex justify-center sm:justify-start gap-4 text-sm font-medium text-muted-foreground">
                <Link to="/followers?tab=followers" className="hover:text-primary transition-colors">Followers</Link>
                <Link to="/followers?tab=following" className="hover:text-primary transition-colors">Following</Link>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {isOwner ? (
                <Button 
                  onClick={() => setIsEditing(!isEditing)} 
                  variant={isEditing ? "outline" : "default"}
                  className="w-full sm:w-auto min-w-[120px]"
                >
                  {isEditing ? "Cancel Edit" : "Edit Profile"}
                </Button>
              ) : (
                <Button 
                  onClick={() => following ? unfollow() : follow()}
                  variant={following ? "outline" : "default"}
                  className="w-full sm:w-auto min-w-[120px] gap-2"
                >
                  {following ? (
                    <><UserCheck className="h-4 w-4" /> Following</>
                  ) : (
                    <><UserPlus className="h-4 w-4" /> Follow</>
                  )}
                </Button>
              )}
            </div>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <Info className="h-3.5 w-3.5" /> Biography
                </div>
                <p className="text-muted-foreground leading-relaxed italic">
                  {profile.biography || "No biography provided."}
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <Quote className="h-3.5 w-3.5" /> Featured Quote
                </div>
                <p className="text-xl font-medium tracking-tight text-foreground/80">
                  "{profile.quote || "Adventurer at heart."}"
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">First Name</Label>
                  <Input id="name" {...register("name")} placeholder="Your first name" />
                  {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">Last Name</Label>
                  <Input id="lastname" {...register("lastname")} placeholder="Your last name" />
                  {errors.lastname && <p className="text-xs text-destructive font-medium">{errors.lastname.message}</p>}
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quote">Inspirational Quote</Label>
                  <Input id="quote" {...register("quote")} placeholder="A short catchphrase..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biography">Biography</Label>
                  <Input id="biography" {...register("biography")} placeholder="Tell us about yourself..." />
                </div>
              </div>
              <div className="md:col-span-2 pt-4 flex justify-end gap-3">
                <Button 
                  type="submit" 
                  disabled={isPending || isUploading}
                  className="min-w-[140px]"
                >
                  {isPending || isUploading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>

      {isOwner && (
        <div className="pt-8">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">
            <User className="h-4 w-4" /> Discovery
          </div>
          <RecommendedProfiles />
        </div>
      )}
    </div>
  );
}