"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "All Users", href: "/" },
  { name: "Add User", href: "/add-user" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">User Management</span>
          </Link>
          
          <div className="flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}