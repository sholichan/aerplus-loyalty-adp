import React from "react";
import { BiCoinStack } from "react-icons/bi";
import { BsDroplet, BsPeople, BsShopWindow } from "react-icons/bs";
import { FiShoppingCart } from "react-icons/fi";
import { GrUserWorker } from "react-icons/gr";
import { IoGiftOutline, IoSettingsOutline } from "react-icons/io5";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { PiFlagBannerFold } from "react-icons/pi";
import { GridIcon } from "../icons";

export type RoleName = "super admin" | "admin" | "member";

export type NavSubItem = {
    name: string;
    path: string;
    /** Nama modul untuk cek can_read. Kosong = selalu tampil untuk user terautentikasi. */
    module?: string;
    /** Jika true, hanya super admin yang bisa lihat item ini */
    superAdminOnly?: boolean;
    pro?: boolean;
    new?: boolean;
};

export type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    /** Nama modul untuk cek can_read. Kosong = selalu tampil untuk user terautentikasi. */
    module?: string;
    /** Jika true, hanya super admin yang bisa lihat item ini */
    superAdminOnly?: boolean;
    subItems?: NavSubItem[];
};

export const mainNavItems: NavItem[] = [
    {
        icon: <GridIcon />,
        name: "Dashboard",
        path: "/",
        // tanpa module → selalu tampil untuk semua role yang login
    },
    {
        icon: <BsPeople size={20} />,
        name: "User",
        subItems: [
            { name: "Member", path: "/memberNew", module: "member" },
            { name: "Partner", path: "/partner", module: "partner" },
            { name: "SPV", path: "/spv", module: "spv" },
        ],
    },
    {
        icon: <IoGiftOutline size={20} />,
        name: "Rewards",
        path: "/reward",
        module: "reward",
    },
    {
        icon: <FiShoppingCart size={20} />,
        name: "Orders",
        path: "/order",
        module: "order",
    },
    {
        icon: <FiShoppingCart size={20} />,
        name: "Shop",
        path: "/shop",
        module: "shop",
    },
    {
        icon: <BsDroplet size={20} />,
        name: "Refill",
        path: "/refill",
        module: "refill",
    },
    {
        icon: <PiFlagBannerFold size={20} />,
        name: "Banners",
        path: "/banner",
        module: "banner",
    },
    {
        icon: <BsShopWindow size={20} />,
        name: "Outlets",
        path: "/outlet",
        module: "outlet",
    },
];

export const otherNavItems: NavItem[] = [
    {
        icon: <MdOutlineAdminPanelSettings size={20} />,
        name: "RBAC",
        superAdminOnly: true,
        subItems: [
            {
                name: "Admin",
                path: "/admin",
                superAdminOnly: true
            },
            {
                name: "Roles",
                path: "/roles",
                superAdminOnly: true,
            },
            {
                name: "Modules",
                path: "/modules",
                superAdminOnly: true,
            },
        ],
    },
    {
        icon: <GrUserWorker size={20} />,
        name: "PIC",
        path: "/pic",
        module: "pic",
    },
    {
        icon: <BiCoinStack size={20} />,
        name: "Point",
        path: "/point",
        module: "point",
    },
    {
        icon: <BiCoinStack size={20} />,
        name: "Benefit",
        path: "/benefit",
        module: "benefit",
    },
    {
        icon: <IoSettingsOutline size={20} />,
        name: "WhatsApp",
        module: "whatsapp",
        subItems: [
            { name: "Session", path: "/whatsapp", pro: false },
            { name: "WAHA", path: "/whatsapp/waha", pro: false },
        ],
    },

];

/**
 * Map path prefix → module name (untuk route protection di layout).
 * Key adalah path prefix, value adalah nama modul.
 */
export const PATH_MODULE_MAP: Record<string, string> = {
    "/memberNew": "member",
    "/partner": "partner",
    "/spv": "spv",
    "/admin": "admin",
    "/reward": "reward",
    "/order": "order",
    "/shop": "shop",
    "/refill": "refill",
    "/banner": "banner",
    "/outlet": "outlet",
    "/pic": "pic",
    "/point": "point",
    "/benefit": "benefit",
    "/whatsapp": "whatsapp",
};

/** Ambil nama modul dari pathname. Null = tidak perlu pengecekan modul. */
export const getModuleForPath = (pathname: string): string | null => {
    for (const [prefix, module] of Object.entries(PATH_MODULE_MAP)) {
        if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
            return module;
        }
    }
    return null;
};

