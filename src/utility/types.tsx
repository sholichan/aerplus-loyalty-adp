export type UserType = {
    id: string;
    user_name: string;
    phone_number: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    outlet_id: number;
    total_point: number;
    new_account: boolean;
    is_active: boolean;
    created_at: string; // atau `Date` jika kamu konversi ke Date object
    updated_at: string; // sama seperti di atas
};

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
