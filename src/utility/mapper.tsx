export function MapRewardPayload (values: any) {
    const basePayload = {
        name: values.name,
        type: values.type,
        point_eligibility: Number(values.point_eligibility),
        stock: values.stock ? Number(values.stock) : null,
        about: values.about,
        tutorial: values.tutorial,
        tnc: values.tnc,
        image: values.image,
        start_period: values.start_period || null,
        end_period: values.end_period || null,
        status: values.is_active ? "active" : "inactive",
    };

    switch (values.type) {
        case "discount":
            return {
                ...basePayload,
                detail: {
                    discount_type: values.discount_type,
                    discount_value: Number(values.discount_value),
                },
            };

        case "bogo":
            return {
                ...basePayload,
                detail: {
                    product_id: values.bogo_product,
                    buy_qty: Number(values.bogo_buy_qty),
                    get_qty: Number(values.bogo_get_qty),
                },
            };

        case "merchandise":
            return {
                ...basePayload,
                detail: {
                    product_id: values.merchandise_id,
                },
            };

        default:
            throw new Error("Invalid reward type");
    }
};

export function getRewardTypeBadge(type: string) {
    switch (type) {
        case "discount":
            return {
                label: "Discount",
                color: "text-blue-700",
            };

        case "bogo":
            return {
                label: "BOGO",
                color: "text-green-700",
            };

        case "merchandise":
            return {
                label: "Merchandise",
                color: "text-amber-800",
            };

        default:
            return {
                label: "Unknown",
                color: "text-gray-700",
            };
    }
}

export function sanitizeFilename(text: string) {
    return text
        .toLowerCase()
        .replace(/\s+/g, "-")          // spasi → dash
        .replace(/[^\w\-]+/g, "")      // hapus karakter aneh
        .replace(/\-\-+/g, "-")        // double dash → single
        .replace(/^-+|-+$/g, "");      // trim dash depan/belakang
}