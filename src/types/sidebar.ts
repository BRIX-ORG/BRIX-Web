import { LucideIcon } from 'lucide-react';

export type SidebarItemType = {
    title: string;
    href: string;
    icon: LucideIcon;
    subItems?: SidebarItemType[];
};

export type SidebarGroup = {
    title: string;
    items: SidebarItemType[];
};
