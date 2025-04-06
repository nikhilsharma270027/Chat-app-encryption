"use client";

import { useEffect, useRef } from "react";
import {
  DrawerBackdrop,
  DrawerContent,
  DrawerRoot,
} from "@/components/ui/drawer";

interface ProfileProps {
  Profile: {
    isGroupChat: boolean;
    profilePic: string;
    avatar: string;
  };
  view: boolean;
  setview: (value: boolean) => void;
}

export default function ViewProfile({ Profile, view, setview }: ProfileProps) {
  const ref = useRef<(() => void) | null>(null);

  // Function to toggle the drawer based on view state
  const toggleView = (status: boolean) => {
    if (view && !status) {
      // Keep open
    } else {
      // Close and update parent state
      setview(false);
    }
  };

  ref.current = () => toggleView(true);

  useEffect(() => {
    // Trigger open/close based on view prop
    if (ref.current) ref.current();
  }, [view]);

  return (
    <DrawerRoot open={view} onOpenChange={(details) => setview(details.open)}>
      <DrawerBackdrop />
      <DrawerContent className="rounded-2xl p-4 flex justify-center items-center">
        <img
          alt="Profile"
          className="h-[70vh] rounded-lg"
          src={Profile.isGroupChat ? Profile.profilePic : Profile.avatar}
        />
      </DrawerContent>
    </DrawerRoot>
  );
}
