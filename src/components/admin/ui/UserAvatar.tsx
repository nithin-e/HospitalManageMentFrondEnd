
import { Avatar, AvatarFallback, AvatarImage } from "@/components/admin/ui/avatar";

interface UserAvatarProps {
  src?: string;
  name: string;
  className?: string;
}

const UserAvatar = ({ src, name, className }: UserAvatarProps) => {
  // Generate initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <Avatar className={className}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
