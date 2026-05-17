import { useParams } from "react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { useProfile, useUpdateProfile } from "@/features/stakeholders/hooks/useProfile";
import { updateProfileSchema, type UpdateProfileFormValues } from "@/lib/schemas";

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const parsedUserId = Number(userId);

  const { user } = useAuthStore();
  const isOwner = user?.id === parsedUserId;

  const { data: profile, isLoading, isError } = useProfile(parsedUserId);
  const { mutate: updateProfile, isPending } = useUpdateProfile(parsedUserId);

  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileFormValues>({
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

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError || !profile) return <p className="p-4">Failed to load profile.</p>;

  function onSubmit(values: UpdateProfileFormValues) {
    updateProfile(
      { ...values, user_id: parsedUserId },
      {
        onSuccess: () => {
          alert("Profile updated.");
          setIsEditing(false);
        },
      }
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 space-y-4">

      {/* Avatar */}
      <div className="flex justify-center">
        <img
          src={profile.imageUrl}
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
            <button className="px-4 py-2 border text-sm rounded">
              Follow
            </button>
          )}
        </>
      ) : (
        /* Edit form */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {(["name", "lastname", "imageUrl", "biography", "quote"] as const).map((field) => (
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
              disabled={isPending}
              className="px-4 py-2 bg-black text-white text-sm rounded disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
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