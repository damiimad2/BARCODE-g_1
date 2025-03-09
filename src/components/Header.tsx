import React from "react";
import { Bell, Settings, User, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface HeaderProps {
  shopName?: string;
  logoUrl?: string;
  userName?: string;
  userAvatarUrl?: string;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
  onAdminClick?: () => void;
}

const Header = ({
  shopName = "Perfume Loyalty",
  logoUrl = "/vite.svg",
  userName = "Admin User",
  userAvatarUrl,
  onSettingsClick = () => {},
  onNotificationsClick = () => {},
  onProfileClick = () => {},
  onAdminClick = () => {},
}: HeaderProps) => {
  return (
    <header className="w-full h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <img src={logoUrl} alt="Shop Logo" className="h-10 w-10" />
        <h1 className="text-xl font-semibold text-gray-800">{shopName}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {localStorage.getItem("adminAuthenticated") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem("adminAuthenticated");
              localStorage.removeItem("admin");
              window.location.reload();
            }}
            className="mr-2 text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            Logout
          </Button>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNotificationsClick}
              >
                <Bell className="h-5 w-5 text-gray-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onSettingsClick}>
                <Settings className="h-5 w-5 text-gray-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onAdminClick}
                className="relative"
              >
                <ShieldCheck className="h-5 w-5 text-gray-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Admin Login</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
          <span className="text-sm font-medium text-gray-700">{userName}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar
                  className="h-9 w-9 cursor-pointer"
                  onClick={onProfileClick}
                >
                  <AvatarImage src={userAvatarUrl} alt={userName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {userName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
};

export default Header;
