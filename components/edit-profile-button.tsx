"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import EditProfileForm from "@/components/edit-profile-form";

type Props = {
  fullName: string;
  userId: string;
};

export default function EditProfileButton({ fullName, userId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        Edit profile
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <EditProfileForm
            fullName={fullName}
            userId={userId}
            onSuccess={() => setIsOpen(false)}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
}
