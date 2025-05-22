"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserPlus, Settings, Bell, ChevronDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { EnvironmentSelector } from "./environment-selector";

const navigation = [
  { name: "Dashboard", href: "/", icon: Users },
  { name: "Add User", href: "/add-user", icon: UserPlus },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md bg-white/80 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#295EEF] to-[#1744D6] text-white shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-xl font-semibold text-gray-900">
                GovPremiere
              </span>
            </Link>
            
            <nav className="hidden items-center space-x-1 md:flex">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center rounded-md px-4 py-2 text-base font-medium transition-colors hover:bg-[#295EEF]/10 hover:text-[#295EEF]",
                      pathname === item.href 
                        ? "bg-[#295EEF]/10 text-[#295EEF]" 
                        : "text-gray-600"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-3">
            <EnvironmentSelector />
            
            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-2 hover:bg-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar-placeholder.png" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-[#295EEF] to-[#1744D6] text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-base font-medium text-gray-700 md:inline-flex">
                    Admin
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}