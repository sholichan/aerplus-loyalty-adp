export const statusStyles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-blue-100 text-blue-700",
    PICKED_UP: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
}
export const statusLabel: Record<string, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    PICKED_UP: "Picked Up",
    CANCELLED: "Cancelled",
}
export const paymentStyles: Record<string, string> = {
    qris: "bg-blue-100 text-blue-700",
    point: "bg-purple-100 text-purple-700",
}
export const paymentLabel: Record<string, string> = {
    qris: "QRIS",
    point: "Poin",
}