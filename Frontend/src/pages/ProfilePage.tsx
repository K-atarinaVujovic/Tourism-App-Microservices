import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { useProfile, useUpdateProfile } from "@/features/stakeholders/hooks/useProfile";
import { updateProfileSchema, type UpdateProfileFormValues } from "@/lib/schemas";
import { useImageUpload } from "@hooks/useImageUpload";
import { uploadProfileImage } from "@/features/stakeholders/services/stakeholdersService";
import { useFollowUser } from "@/features/followers/hooks/useProfile";

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const parsedUserId = Number(userId);

  const { user } = useAuthStore();
  const isOwner = user?.id === parsedUserId;

  const { data: profile, isLoading, isError } = useProfile(parsedUserId);
  const { mutate: updateProfile, isPending } = useUpdateProfile(parsedUserId);

  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { upload, isUploading } = useImageUpload(uploadProfileImage);

  const { mutate: followUser } = useFollowUser();

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

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError || !profile) return <p className="p-4">Failed to load profile.</p>;

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
          alert("Profile updated.");
          setIsEditing(false);
          setPendingFile(null);
        },
      }
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 space-y-4">
      {/* Avatar */}
      <div className="flex justify-center">
        <img
          src={previewUrl || profile.imageUrl}
          alt="Profile image"
          className="size-24 rounded-full object-cover"
        />
      </div>

      {!isEditing ? (
        <>
          {/* Info */}
          <div className="space-y-1 text-center">
            <p className="text-xl font-semibold">{profile.name} {profile.lastname}</p>
            <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Bio:</span> {profile.biography}</p>
            <p><span className="font-medium">Quote:</span> "{profile.quote}"</p>
          </div>

          {/* Actions */}
          {isOwner ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-black text-white text-sm rounded"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={() => followUser(parsedUserId)}
              className="px-4 py-2 border text-sm rounded"
            >
              Follow
            </button>
          )}
        </>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(e); }} className="space-y-3">

          {/* Image upload */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setPendingFile(file);
                setPreviewUrl(URL.createObjectURL(file));
              }}
              className="text-sm"
            />
            {isUploading && <span className="text-xs text-gray-500">Uploading...</span>}
          </div>

          {/* Other fields */}
          {(["name", "lastname", "biography", "quote"] as const).map((field) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-sm font-medium capitalize">{field}</label>
              <input
                {...register(field)}
                className="border rounded px-3 py-1.5 text-sm"
              />
              {errors[field] && (
                <span className="text-xs text-red-500">{errors[field]?.message}</span>
              )}
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="px-4 py-2 bg-black text-white text-sm rounded disabled:opacity-50"
            >
              {isPending || isUploading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setPendingFile(null);
                setPreviewUrl(profile.imageUrl);
              }}
              className="px-4 py-2 border text-sm rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}