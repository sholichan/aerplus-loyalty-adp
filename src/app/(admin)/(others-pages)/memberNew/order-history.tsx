export interface Order {
    id: string;
    ref_id: string;
    outlet: string;
    qty: number;
    price: number;
    total_amount: number;
    total_benefit: number;
    redeem_code: string;
    is_void: boolean;
    point: string;
    created_at: string;
}

interface UserOrderHistoryProps {
    orders: Order[];
}

export const UserOrderHistory: React.FC<UserOrderHistoryProps> = ({ orders }) => {
    return (
        <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order History
            </h4>
            {(orders?.length > 0) && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                {[
                                    "No",
                                    "Inv Ref",
                                    "Outlet",
                                    "Qty",
                                    "Price",
                                    "Total",
                                    "Redeem Code",
                                    "Point",
                                    "Date",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {orders.map((order, index) => (
                                <tr
                                    key={order.id}
                                    className={order.is_void ? "bg-rose-100 hover:bg-gray-50 dark:hover:bg-gray-900" : "hover:bg-gray-50 dark:hover:bg-gray-900"}
                                >
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-400">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-400">
                                        {order.ref_id}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {order.outlet}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {order.qty}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        Rp {order.price.toLocaleString("id-ID")}
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-medium ${order.total_benefit > 0
                                            ? "text-green-600 dark:text-green-400"
                                            : ""
                                            }`}
                                    >
                                        Rp {order.total_amount.toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {order.redeem_code !== "" ? (
                                            <b>{order.redeem_code}</b>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {order.point}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {(orders?.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No order history
                </div>
            )}
        </div>
    )
}