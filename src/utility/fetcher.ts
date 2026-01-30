import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GetProduct(token: string) {
    try {
        const res = await fetch(`${API_URL}admin/product`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const json = await res.json()

        return json.data;
    } catch (err) {
        console.error('Fetcher.GetProduct', err)
        toast.error("Failed to load product list");
    }
}