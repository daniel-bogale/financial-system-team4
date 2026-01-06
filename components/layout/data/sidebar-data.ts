import { Users, Home, Wallet, ReceiptText, Settings } from "lucide-react";
import { type SidebarData } from "../types";

export const sidebarData: SidebarData = {
  user: {
    id: "123",
    name: "Loading...",
    email: "loading...",
    avatar: "",
    role: "STAFF",
  },
  teams: [],
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Home",
          url: "/home",
          icon: Home,
        },
        {
          title: "Users",
          url: "/users",
          icon: Users,
        },
        {
          title: "Cash",
          url: "/cash",
          icon: Wallet,
        },
        {
          title: "Expenses",
          url: "/expenses",
          icon: ReceiptText,
        },
        {
          title: "Budget",
          url: "/budgets",
          icon: Wallet,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Settings",
          icon: Settings,
          url: "/settings",
        },
      ],
    },
  ],
};
