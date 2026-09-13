"use client";

import * as React from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { translations } from "@/lib/translations";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  IconBuilding,
  IconUserCheck,
  IconUserCog,
  IconSchool,
  IconReport,
  IconBook2,
  IconBuildingSkyscraper,
  IconTools,
  IconMail,
  IconSettings,
  IconPalette,
  IconApps,
  IconUserCircle,
  IconBook,
} from "@tabler/icons-react";

function useLanguage() {
  const [language, setLanguage] = React.useState("en");

  React.useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved && ["en", "km", "zh"].includes(saved)) {
      setLanguage(saved);
    }

    const handleChange = () => {
      const saved = localStorage.getItem("language");
      if (saved && ["en", "km", "zh"].includes(saved)) {
        setLanguage(saved);
      }
    };

    window.addEventListener("languagechange", handleChange);
    return () => window.removeEventListener("languagechange", handleChange);
  }, []);

  return language;
}

const t = (key: string, lang: string): string => {
  return translations[lang]?.[key] || translations["en"][key] || key;
};

type NavItem = {
  title: string;
  url?: string;
  icon?: React.ReactNode;
  color?: string;
  children?: NavItem[];
};

const superAdminNavItems = (lang: string): NavItem[] => [
  {
    title: t("sidebar.schoolManagement", lang),
    url: "/dashboard/super-admin",
    icon: <IconSchool className="text-green-500" />,
    color: "green",
    children: [
      {
        title: t("sidebar.viewSchool", lang),
        url: "/dashboard/school/view",
        icon: <IconBuildingSkyscraper className="text-blue-500" />,
      },
      {
        title: t("sidebar.users", lang),
        url: "/dashboard/users",
        icon: <IconUserCog className="text-purple-500 transition-all duration-300 group-hover:animate-cog-rotate" />,
      },
      {
        title: t("sidebar.messages", lang),
        url: "/dashboard/messages",
        icon: <IconMail className="text-pink-500 transition-all duration-300 group-hover:animate-mail-wiggle" />,
      },
    ],
  },
  {
    title: t("sidebar.settings", lang),
        icon: <IconSettings className="text-gray-500" size={20} />,
        color: "gray",
    children: [
      {
        title: t("sidebar.toolManagement", lang),
        url: "/dashboard/tool-management",
        icon: <IconTools className="text-cyan-500" size={14} />,
      },

      {
        title: t("sidebar.reports", lang),
        url: "/dashboard/reports",
        icon: <IconReport className="text-red-500" />,
      },
      {
        title: t("sidebar.customUI", lang),
        url: "/dashboard/settings/custom-ui",
        icon: <IconPalette className="text-gray-500" />,
      },
    ],
  },
];

const schoolAdminNavItems = (lang: string): NavItem[] => [
  {
    title: t("sidebar.schoolManagement", lang),
    url: "/dashboard/school-admin",
    icon: <IconSchool className="text-green-500" />,
    color: "green",
      children: [
        {
          title: t("dashboard.branch", lang),
        url: "/dashboard/Branch",
        icon: <IconBuilding className="text-indigo-500" />,
      },
      {
        title: t("dashboard.student", lang),
        url: "/dashboard/Student",
        icon: <IconSchool className="text-green-500 transition-all duration-300 group-hover:animate-school-bounce" />,
      },
      {
        title: t("dashboard.teacher", lang),
        url: "/dashboard/Teacher",
        icon: <IconUserCheck className="text-yellow-500 transition-all duration-300 group-hover:scale-110 group-hover:translate-y-[-1px]" />,
      },
      {
        title: t("dashboard.level", lang),
        url: "/dashboard/Level",
        icon: <IconBook2 className="text-blue-500 transition-all duration-300 group-hover:animate-book-flip" />,
      },
      {
        title: t("dashboard.report", lang),
        url: "/dashboard/Report",
        icon: <IconReport className="text-red-500" />,
      },
      
    ],
  },
  {
    title: t("sidebar.settings", lang),
        icon: <IconSettings className="text-gray-500" size={20} />,
        color: "gray",
    children: [
      {
        title: t("sidebar.toolManagement", lang),
        url: "/dashboard/tool-management",
        icon: <IconTools className="text-cyan-500" size={14} />,
      },

      {
        title: t("sidebar.customUI", lang),
        url: "/dashboard/settings/custom-ui",
        icon: <IconPalette className="text-gray-500" />,
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const language = useLanguage();
  const { user } = useAuth();


  const getUserForDisplay = () => {
    const getAvatarUrl = (av?: string) => {
      if (!av || av === "profile.png" || av.includes("shadcn.jpg")) {
        return "/resources/avatar/non_pic.jpg";
      }
      return av;
    };

    if (!user)
      return { name: "Guest", email: "", avatar: "/resources/avatar/non_pic.jpg", phone: "" };
    return {
      name: user.username || user.email.split("@")[0],
      email: user.email,
      avatar: getAvatarUrl(user.avatar),
      phone: user.phonenumber || "",
    };
  };

  const getUserNavItems = (): NavItem[] => {
    if (!user) return [];
    if (user.user_type === "SUPER_ADMIN") return superAdminNavItems(language);
    return schoolAdminNavItems(language);
  };

  const data = {
    user: getUserForDisplay(),
    navMain: getUserNavItems(),
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="pb-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5! h-auto">
              <div className="flex items-center gap-2 py-0.5 min-w-0">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-border/40 shadow-sm bg-background">
                  <Image
                    src="/resources/avatar/nk.png"
                    alt="NK ONE School"
                    width={28}
                    height={28}
                    className="size-full object-cover"
                    priority
                  />
                </div>
                <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                  <span className="text-[11px] font-bold tracking-tight truncate">
                    {t("app.title", language)}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <div className="px-3 group-data-[collapsible=icon]:hidden">
        <div className="h-px bg-gradient-to-r from-sidebar-border/80 via-sidebar-border to-transparent" />
      </div>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
