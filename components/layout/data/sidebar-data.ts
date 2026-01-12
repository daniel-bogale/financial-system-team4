import { Users, Home, DollarSign, Plus, FileText, BarChart3 } from "lucide-react";
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
      ],
    },
    {
      title: "Budget",
      items: [
        {
          title: "Budget Overview",
          url: "/budget",
          icon: DollarSign,
        },
        {
          title: "Budget Management",
          icon: BarChart3,
          items: [
            {
              title: "Create Cash Request",
              url: "/budget/create",
              icon: Plus,
            },
            {
              title: "Cash Requests",
              url: "/budget/requests",
              icon: FileText,
            },
          ],
        },
      ],
    },
  ],
};
