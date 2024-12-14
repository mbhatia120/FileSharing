import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export default function UserNav() {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          {user?.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="w-full cursor-pointer">
            Dashboard
          </Link>
        </DropdownMenuItem>
        
        {user?.role === 'ADMIN' && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="w-full cursor-pointer">
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={logout}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 