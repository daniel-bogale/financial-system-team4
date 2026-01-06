"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { setUserFullName, setUserPassword, setUserAvatar } from "@/lib/settings";

type Props = {
  fullName: string;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function EditProfileForm({ fullName, userId, onSuccess, onCancel }: Props) {
  const [name, setName] = useState(fullName);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {

      if (password && password !== passwordConfirm) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      await setUserFullName(name);

      if (password) {
        await setUserPassword(password);
      }

      // Upload avatar if provided
      if (avatar) {
        const fileExt = avatar.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}-avatar.${fileExt}`;
        await setUserAvatar(fileName, avatar);
      }

      toast.success("Profile updated successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Error updating profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Edit Profile</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div>
          <Label htmlFor="avatar">Avatar</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />
          {avatar && <p className="text-sm text-muted-foreground mt-1">{avatar.name}</p>}
        </div>

        <div>
          <Label htmlFor="password">New Password (optional)</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave empty to keep current password"
          />
        </div>

        <div>
          <Label htmlFor="passwordConfirm">Confirm Password</Label>
          <Input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Confirm new password"
            disabled={!password}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
