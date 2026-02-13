"use client";
import { PulseLoading } from "@/components/common/loading";
import Input from "@/components/form/input/InputField";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import LimitPagination from "@/components/tables/LimitPagination";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { useOutlet } from "@/context/OutletContext";
import { ChevronDownIcon } from "@/icons";
import { PlusIcon } from "@/icons"
import { RootState } from "@/store";
import { clearToken } from "@/store/slices/authSlices";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import RequiredSymbol from "@/components/common/RequiredSymbol";
import { Redeem, UserRedeemHistory } from "./redeem-history"
import { Order, UserOrderHistory } from "./order-history"
import DatePicker from "@/components/form/date-picker";

export interface LocationInfo {
    name: string;
}

export interface NewUserType {
    id: string;
    user_name: string;
    phone_number: string;
    address: string;
    is_active: boolean;
    new_account: boolean;
    total_point: number;
    created_at: string;
    outlet?: LocationInfo;
    province?: LocationInfo;
    city?: LocationInfo;
    order_count: number;
}

export default function UserOrderTable() {
    const dispatch = useDispatch();
    const router = useRouter();
    const auth = useSelector((state: RootState) => state.auth);
    const { selectedOutlet } = useOutlet();
    const { isOpen, openModal, closeModal } = useModal();

    const [injectPoin, setInjectPoin] = useState<string>("");
    const [memberId, setMemberId] = useState<string | null>(null);
    const [disableAddPoin, setDisableAddPoin] = useState<boolean>(false);

    const [orders, setOrders] = useState<Order[]>([]);
    const [redeems, setRedeems] = useState<Redeem[]>([]);
    const [tableData, setTableData] = useState<NewUserType[]>([]);
    const [tableDataToCsv, setTableDataToCsv] = useState<NewUserType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState<string>("");
    const [searchButton, setSearchButton] = useState<boolean>(false);
    const [prevSelOutlet, setPrevSelOutlet] = useState<string>("");
    const [openRow, setOpenRow] = useState<string | null>(null);
    const [getOrderLoading, setGetOrderLoading] = useState<boolean>(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const toggleRow = async (id: string) => {
        setOpenRow(openRow === id ? null : id);
        setGetOrderLoading(true);

        const orderByUser = fetchOrdersByUser(id);
        const redeemByUser = fetchRedeemsByUser(id);
        await Promise.all([orderByUser, redeemByUser])

        setGetOrderLoading(false);
    };

    // Authentication guard
    useEffect(() => {
        const now = Date.now() / 1000;
        const tokenExpired = auth.user?.exp ? now > auth.user.exp : true;
        const notSuperAdmin = auth.user?.role.name !== "super admin";

        if (tokenExpired || notSuperAdmin) {
            localStorage.clear();
            dispatch(clearToken());
            router.push("/signin");
            toast.warn("Your session has expired. Please sign in again!");
        } else {
            setRefresh(!refresh);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.token]);

    // Fetch users
    useEffect(() => {
        setPrevSelOutlet(selectedOutlet);
        if (prevSelOutlet !== selectedOutlet) {
            setIsLoading(true);
        }

        if (auth.token) {
            fetchUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, currentPage, limit, searchButton, selectedOutlet]);

    const fetchUsers = async () => {
        try {

            let usersURL = `${API_URL}/admin/user/get-all?search=${search}&outletId=${selectedOutlet}&page=${currentPage}&limit=${limit}`
            if (startDate && endDate) {
                usersURL += `&startDate=${startDate}&endDate=${endDate}`
            }

            const response = await fetch(
                usersURL,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                }
            );

            const res = await response.json();
            if (res.statusCode === 200) {
                setTableData(res.data.users);
                setTotalPages(res.data.totalPages);
                setTotalItems(res.data.totalItems);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
        setIsLoading(false);
    };

    const fetchOrdersByUser = async (id: string) => {
        try {
            const response = await fetch(
                `${API_URL}/admin/order/list/user/${id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                }
            );

            const res = await response.json();
            if (res.statusCode === 200) {
                setOrders(res.data)
            }

        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    const fetchRedeemsByUser = async (id: string) => {
        try {
            const response = await fetch(
                `${API_URL}/admin/redeem/list/user/${id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                }
            );

            const res = await response.json();
            if (res.statusCode === 200) {
                setRedeems(res.data)
            }

        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    const handleInjectPoint = async () => {
        if (injectPoin) {
            setDisableAddPoin(true)

            await fetch(
                `${API_URL}/point/debug/inject-point`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                    body: JSON.stringify({
                        "user_id": memberId,
                        "points": Number(injectPoin)
                    }),
                }
            );

            toast.success("Points added successfully!");
            fetchUsers();
            closeModal();
        }
    };

    useEffect(() => {
        const fetchMemberToCsv = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/admin/user/get-all?search=&outletId=${selectedOutlet}&page=1&limit=${totalItems}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${auth.token}`,
                        },
                    }
                );
                const res = await response.json();

                if (res.statusCode === 200) {
                    setTableDataToCsv(res.data.users);
                }
            } catch (error) {
                console.error("Error fetching vouchers:", error);
            }
            setIsLoading(false);
        };
        fetchMemberToCsv();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOutlet, totalItems]);

    const handlePaginationChange = (page: number, limit: number) => {
        setIsLoading(true);
        setCurrentPage(page);
        setLimit(limit);
    };

    // === CSV EXPORT HANDLER ===
    const exportToCSV = () => {
        const rows = [
            header,
            ...tableDataToCsv.map((i, index) => [
                (currentPage - 1) * 10 + (index + 1),
                i.user_name,
                i.phone_number,
                i.address ? i.address : "-",
                i.outlet ? i.outlet.name : "-",
                i.created_at ? dateConvert(i.created_at) + " " + timeConvert(i.created_at) : "-",
                i.total_point ? i.total_point : 0,
                i.is_active ? "Active" : "Inactive",
            ]),
        ];

        // pakai ";" biar Excel auto split kolom
        const csvContent =
            "data:text/csv;charset=utf-8," +
            rows.map((e) => e.join(";")).join("\n");

        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.setAttribute("download", `members-${selectedOutlet !== "" ? tableDataToCsv[0]?.outlet?.name : "all"}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const dateConvert = (isoString: string) => {
        const parsedDate = dayjs(isoString);
        const date: string = parsedDate.format('YYYY-MM-DD');
        return date
    }

    const timeConvert = (isoString: string) => {
        const parsedDate = dayjs(isoString);
        const time: string = parsedDate.format('HH:mm:ss');
        return time
    }
    const header = ["No", "Name", "Phone", "Address", "Outlet", "Join date", "Point", "Status"];

    if (isLoading) return <PulseLoading />;

    return (
        <div>
            <div className="grid grid-cols-12 gap-4 md:gap-6 mb-4">
                <div className="col-span-12 rounded-2xl px-6 pt-10 pb-6 border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    {/* Date Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="relative w-full">
                            <div className="absolute left-2.5 -top-[10px] inline-flex -translate-y-1/2 items-center text-xs text-gray-500">
                                Start
                            </div>
                            <DatePicker
                                id="start_date"
                                placeholder="Start Date"
                                mode="single"
                                onChange={(selectedDates: Date[], dateStr: string) => {
                                    setStartDate(dateStr)
                                }}
                                defaultDate={new Date(startDate)}
                            />
                        </div>
                        <div className="relative w-full">
                            <div className="absolute left-2.5 -top-[10px] inline-flex -translate-y-1/2 items-center text-xs text-gray-500">
                                End
                            </div>
                            <DatePicker
                                id="end_date"
                                placeholder="End Date"
                                mode="single"
                                onChange={(selectedDates: Date[], dateStr: string) => {
                                    setEndDate(dateStr)
                                }}
                                defaultDate={endDate ? new Date(endDate) : undefined}
                                minDate={startDate ? new Date(startDate) : undefined}
                            />
                        </div>
                    </div>
                    {/* Button Section */}
                    <div className="flex flex-col md:flex-row gap-3 md:justify-start">
                        <button
                            onClick={() => {
                                setIsLoading(true);
                                fetchUsers()
                            }}
                            className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                        >
                            Apply
                        </button>
                        <button
                            onClick={() => {
                                setStartDate("")
                                setEndDate("")
                                setCurrentPage(1)
                            }}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                {/* Header */}

                <div className="px-6 py-5 md:flex justify-between items-center space-y-4 md:space-y-0">
                    {/* Search bar */}
                    <div className="relative w-full md:w-auto">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg
                                className="fill-gray-500 dark:fill-gray-400"
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M3.04 9.37C3.04 5.88 5.88 3.04 9.37 3.04C12.87 3.04 15.71 5.88 15.71 9.37C15.71 12.87 12.87 15.71 9.37 15.71C5.88 15.71 3.04 12.87 3.04 9.37ZM9.37 1.54C5.05 1.54 1.54 5.05 1.54 9.37C1.54 13.7 5.05 17.21 9.37 17.21C11.27 17.21 13 16.53 14.36 15.42L17.18 18.24C17.47 18.53 17.94 18.53 18.24 18.24C18.53 17.95 18.53 17.47 18.24 17.18L15.42 14.36C16.54 13 17.21 11.27 17.21 9.37C17.21 5.05 13.7 1.54 9.37 1.54Z"
                                />
                            </svg>
                        </span>
                        <Input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === "Enter") {
                                    setCurrentPage(1);
                                    setIsLoading(!isLoading);
                                    setSearchButton(!searchButton);
                                }
                            }}
                            className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 xl:w-[430px]"
                        />
                        <button
                            onClick={() => {
                                setCurrentPage(1);
                                setIsLoading(!isLoading);
                                setSearchButton(!searchButton);
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            Search
                        </button>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 w-full md:w-fit rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                    >
                        Export CSV
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                {["No", "Name", "Phone", "Outlet", "Total Orders", "Status", ""].map(
                                    (header) => (
                                        <th
                                            key={header}
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                                        >
                                            {header}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {tableData.map((user, index) => {
                                const isOpenRow = openRow === user.id;

                                return (
                                    <React.Fragment key={user.id}>
                                        {/* Main Row */}
                                        <tr
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                            onClick={() => toggleRow(user.id)}
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {user.user_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {user.phone_number || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {user.outlet?.name || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.order_count > 0
                                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                                        }`}
                                                >
                                                    {user.order_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${user.is_active
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                        }`}
                                                >
                                                    {user.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <ChevronDownIcon
                                                    className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isOpenRow ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </td>
                                        </tr>

                                        {/* Accordion Row */}
                                        {isOpenRow && (
                                            <tr className="bg-gray-50 dark:bg-gray-800">
                                                <td colSpan={7} className="p-0">
                                                    <div className="border-t border-gray-200 dark:border-gray-700 bg-blue-100 dark:bg-blue-900 px-6 py-6 space-y-6">
                                                        {/* User Info */}
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                                User Information
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm p-4 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-300">
                                                                <div>
                                                                    <span className="text-gray-500 dark:text-gray-400">Address:</span>{" "}
                                                                    <span className="font-medium">{user.address || "-"}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 dark:text-gray-400">City:</span>{" "}
                                                                    <span className="font-medium">{user.city?.name || "-"}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 dark:text-gray-400">Province:</span>{" "}
                                                                    <span className="font-medium">{user.province?.name || "-"}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 dark:text-gray-400">
                                                                        Total Points:
                                                                    </span>{" "}
                                                                    <span className="font-medium">
                                                                        {user.total_point ?? "-"}
                                                                    </span>{" "}
                                                                    <Button size="xs" onClick={() => {
                                                                        openModal()
                                                                        setInjectPoin("")
                                                                        setMemberId(user.id)
                                                                        setDisableAddPoin(false)
                                                                    }} variant="primary"><PlusIcon /></Button>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 dark:text-gray-400">
                                                                        Joined:
                                                                    </span>{" "}
                                                                    <span className="font-medium">
                                                                        {new Date(user.created_at).toLocaleDateString("en-GB")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {getOrderLoading && <PulseLoading />}
                                                        {/* Order History */}
                                                        {(!getOrderLoading) && <UserOrderHistory orders={orders} />}

                                                        {/* Redeem History */}
                                                        {(!getOrderLoading) && <UserRedeemHistory redeems={redeems} />}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex p-4 border-t border-gray-200 dark:border-gray-700">
                    <LimitPagination
                        currentPage={currentPage}
                        limit={limit}
                        totalPages={totalPages}
                        onPaginationChange={handlePaginationChange}
                    />
                </div>
            </div>

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Inject Point
                        </h4>
                    </div>
                    <div className="flex flex-col">
                        <Label>Point <RequiredSymbol /></Label>
                        <Input
                            name="point"
                            type="number"
                            min="0"
                            placeholder="Point"
                            value={injectPoin}
                            onChange={(e) => {
                                setInjectPoin(e.target.value)
                            }}
                        />
                        <div className="text-sm text-red-500">Point amount is required</div>
                    </div>
                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                        <Button size="sm" variant="outline" onClick={closeModal}>
                            Close
                        </Button>
                        <Button size="sm" type="button" disabled={disableAddPoin} onClick={handleInjectPoint}>
                            {disableAddPoin ? 'Loading...' : 'Add Poin'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
