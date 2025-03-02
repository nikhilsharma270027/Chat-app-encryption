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
  