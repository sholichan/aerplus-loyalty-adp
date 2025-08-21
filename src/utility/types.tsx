// export type UserType = {
//     id: string;
//     user_name: string;
//     phone_number: string;
//     address: string | null;
//     latitude: number | null;
//     longitude: number | null;
//     outlet_id: number;
//     total_point: number;
//     new_account: boolean;
//     is_active: boolean;
//     created_at: string; // atau `Date` jika kamu konversi ke Date object
//     updated_at: string; // sama seperti di atas
// };

export interface UserType {
    id: string;
    user_name: string;
    phone_number: string;
    province_id: string | null;
    city_id: string | null;
    subdistrict_id: string | null;
    address: string;
    latitude: string;
    longitude: string;
    outlet_id: number | null;
    total_point: number | null;
    new_account: boolean;
    outlet: OutletType;
    province: Province;
    city: City;
    subdistrict: Subdistrict;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface OrderType {
    id: string;
    user_id: string | null;
    ref_id: string;
    outlet: string;
    qty: number;
    price: number;
    amount: number;
    total_amount: number;
    voucher_code: string;
    total_benefit: number,
    benefit_value: number,
    benefit_type: string,
    user: UserType | null; // Ganti `any` dengan tipe `User` jika kamu punya tipe User
    created_at: string; // atau bisa pakai `Date` jika kamu parsing ke Date
    updated_at: string; // atau `Date`
}

export type PointType = {
    id: string;
    point: number;
    created_at: string; // atau `Date` jika diparsing ke objek Date
    updated_at: string; // atau `Date`
};

export type BenefitType = {
    id: string;
    value: number;
    type: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type BannerType = {
    id: string;
    name: string;
    content: string;
    url: string;
    end_date: string;
    is_active: string;
    created_at: string; // atau `Date` jika diparsing ke objek Date
    updated_at: string; // atau `Date`
};

export type VoucherType = {
    id: string;
    code: string;
    phone_number: string | null;
    outlet_name: string | null;
    discount_type: "percentage" | "fixed"; // asumsi hanya dua jenis
    discount_value: number;
    usage_limit: number | null;
    description: string;
    start_date: string; // atau bisa pakai Date jika akan dikonversi
    end_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type SalesOrderType = {
    total_sales: number;
    total_orders: number;
};

export type TotalUserType = {
    total_user: number;
};

export type MonthlyOrderStatType = {
    month: string;
    total_orders: string;
};
export type MonthlySalesStatType = {
    month: string;
    total_sales: string;
};

export interface OutletType {
    id: number;
    name: string;
    address: string;
    phone: string;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

export interface Province {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface City {
    id: string;
    province_id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Subdistrict {
    id: string;
    city_id: string;
    name: string;
    created_at: string;
    updated_at: string;
}


