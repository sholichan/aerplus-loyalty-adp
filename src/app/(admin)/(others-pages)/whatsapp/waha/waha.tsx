"use client";

import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { RootState } from "@/store";
import { clearToken } from "@/store/slices/authSlices";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CiCircleAlert } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Image from "next/image";

const SESSION = "default";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type WahaMe = {
    id: string;
    pushName: string;
} | null;

type WahaWebhook = {
    url: string;
    events?: string[];
    hmac?: { key: string };
};

type WahaSession = {
    name: string;
    status: "STOPPED" | "STARTING" | "SCAN_QR_CODE" | "WORKING" | "FAILED";
    me: WahaMe;
    config?: {
        webhooks?: WahaWebhook[];
    };
};

const WahaSessionPage: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const auth = useSelector((state: RootState) => state.auth);

    const [session, setSession] = useState<WahaSession | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [qrImage, setQrImage] = useState<string | null>(null);
    const { isOpen, openModal, closeModal } = useModal();
    const [confirmAction, setConfirmAction] = useState<() => void>(() => () => { });
    const [confirmText, setConfirmText] = useState<string>("");

    // Webhook info (read-only)
    const [webhookInfo, setWebhookInfo] = useState<{
        webhook_path: string;
        hmac_enabled: boolean;
        session_webhooks: WahaWebhook[];
    } | null>(null);

    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Auth guard — copied from whatsapp.tsx
    useEffect(() => {
        const now = Date.now() / 1000;
        let exp = true;
        if (auth.user?.exp !== undefined) exp = now > auth.user?.exp;
        if (auth.user?.role.name !== "super admin" || exp) {
            localStorage.clear();
            dispatch(clearToken());
            router.push("/signin");
            toast.warn("Your session has expired, please login!");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.token, router]);

    const fetchStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}admin/waha/sessions/${SESSION}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            const json = await response.json();
            if (!response.ok) {
                toast.error(json.err || "Gagal memuat status");
                return;
            }
            const data: WahaSession = json.data;
            setSession(data);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat status sesi");
        }
    }, [auth.token]);

    const fetchQr = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}admin/waha/sessions/${SESSION}/qr`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            const json = await response.json();
            if (!response.ok) {
                toast.error(json.err || "Gagal memuat QR");
                setQrImage(null);
                return;
            }
            setQrImage(json.data.qr);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat QR");
            setQrImage(null);
        }
    }, [auth.token]);

    const fetchWebhookInfo = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}admin/waha/sessions/${SESSION}/webhook-info`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            const json = await response.json();
            if (!response.ok) return;
            setWebhookInfo(json.data);
        } catch (error) {
            console.error(error);
        }
    }, [auth.token]);

    // Initial fetch on mount
    useEffect(() => {
        fetchStatus();
        fetchWebhookInfo();
    }, [fetchStatus, fetchWebhookInfo]);

    // Polling saat status transien (STARTING / SCAN_QR_CODE) supaya panel
    // auto-refresh sampai status final (WORKING/FAILED/STOPPED) — tidak nyangkut
    // di "Menyiapkan..." saat WAHA baru start/restart.
    useEffect(() => {
        const isTransient =
            session?.status === "STARTING" || session?.status === "SCAN_QR_CODE";
        if (session?.status === "SCAN_QR_CODE") {
            fetchQr();
        }
        if (isTransient) {
            pollingRef.current = setInterval(() => {
                fetchStatus();
                if (session?.status === "SCAN_QR_CODE") {
                    fetchQr();
                }
            }, 3000);
        } else {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
            if (session?.status === "WORKING") {
                setQrImage(null);
            }
        }
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [session?.status, fetchStatus, fetchQr]);

    const handleStart = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}admin/waha/sessions/${SESSION}/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({}),
            });
            const json = await response.json();
            if (!response.ok) {
                toast.error(json.err || "Gagal memulai sesi");
                return;
            }
            toast.success("Sesi berhasil dimulai");
            await fetchStatus();
        } catch (error) {
            console.error(error);
            toast.error("Gagal memulai sesi");
        } finally {
            setLoading(false);
        }
    };

    const handleRestart = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}admin/waha/sessions/${SESSION}/restart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({}),
            });
            const json = await response.json();
            if (!response.ok) {
                toast.error(json.err || "Gagal me-restart sesi");
                return;
            }
            toast.success("Sesi di-restart");
            await fetchStatus();
        } catch (error) {
            console.error(error);
            toast.error("Gagal me-restart sesi");
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}admin/waha/sessions/${SESSION}/stop`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({}),
            });
            const json = await response.json();
            if (!response.ok) {
                toast.error(json.err || "Gagal menghentikan sesi");
                return;
            }
            toast.success("Sesi berhasil dihentikan");
            await fetchStatus();
        } catch (error) {
            console.error(error);
            toast.error("Gagal menghentikan sesi");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}admin/waha/sessions/${SESSION}/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({}),
            });
            const json = await response.json();
            if (!response.ok) {
                toast.error(json.err || "Gagal logout sesi");
                return;
            }
            toast.success("Berhasil logout dari sesi");
            await fetchStatus();
        } catch (error) {
            console.error(error);
            toast.error("Gagal logout sesi");
        } finally {
            setLoading(false);
        }
    };

    const openConfirmModal = (text: string, action: () => void) => {
        setConfirmText(text);
        setConfirmAction(() => action);
        openModal();
    };

    const getStatusBadge = (status?: string) => {
        if (!status) return null;
        const colorMap: Record<string, string> = {
            WORKING: "bg-green-500 text-white",
            SCAN_QR_CODE: "bg-yellow-400 text-black",
            STARTING: "bg-yellow-400 text-black",
            STOPPED: "bg-red-500 text-white",
            FAILED: "bg-red-500 text-white",
        };
        const cls = colorMap[status] ?? "bg-gray-400 text-white";
        return (
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Status Panel */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br bg-blue-950 text-white shadow-2xl">
                <div className="p-8 space-y-4">
                    <h1 className="text-2xl font-bold text-blue-100">WAHA Session</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-blue-200 text-sm">Sesi:</span>
                        <span className="font-mono text-blue-100 text-sm">{SESSION}</span>
                        {getStatusBadge(session?.status)}
                    </div>

                    {session?.me && (
                        <div className="rounded-lg bg-white/10 p-3 text-sm space-y-1">
                            <p>
                                <span className="text-blue-300">Nomor pengirim OTP: </span>
                                <span className="font-semibold">{session.me.id?.split("@")[0]}</span>
                            </p>
                            <p>
                                <span className="text-blue-300">Nama: </span>
                                {session.me.pushName}
                            </p>
                            <p className="text-blue-300/80 text-xs">
                                Deeplink verifikasi otomatis mengikuti nomor ini.
                            </p>
                        </div>
                    )}

                    {/* QR Code display */}
                    {session?.status === "SCAN_QR_CODE" && (
                        <div className="flex flex-col items-center space-y-4 pt-4">
                            {qrImage ? (
                                <Image
                                    src={qrImage}
                                    alt="WAHA QR Code"
                                    className="mx-auto w-72 h-72 border border-gray-300 shadow-md rounded-lg bg-white"
                                    width={100}
                                    height={100}
                                    unoptimized
                                />
                            ) : (
                                <div className="w-72 h-72 flex items-center justify-center bg-white/10 rounded-lg">
                                    <span className="text-blue-200 text-sm">Memuat QR...</span>
                                </div>
                            )}
                            <p className="text-blue-200 text-sm">Scan QR (otomatis refresh)</p>
                            <Button
                                onClick={fetchQr}
                                disabled={loading}
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                            >
                                Refresh QR
                            </Button>
                        </div>
                    )}

                    {/* STARTING state */}
                    {session?.status === "STARTING" && (
                        <div className="flex items-center gap-2 pt-2">
                            <svg
                                className="animate-spin h-5 w-5 text-yellow-300"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                />
                            </svg>
                            <span className="text-yellow-200 text-sm">Menyiapkan...</span>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        {(!session || session.status === "STOPPED") && (
                            <Button
                                onClick={handleStart}
                                disabled={loading}
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                            >
                                Start Session
                            </Button>
                        )}
                        {(session?.status === "FAILED" || session?.status === "STARTING") && (
                            <Button
                                onClick={handleRestart}
                                disabled={loading}
                                className="bg-yellow-500/70 hover:bg-yellow-500/90 text-white border-white/30"
                            >
                                Restart Session
                            </Button>
                        )}
                        {session?.status === "WORKING" && (
                            <>
                                <Button
                                    onClick={() =>
                                        openConfirmModal("Hentikan sesi WhatsApp?", handleStop)
                                    }
                                    disabled={loading}
                                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                >
                                    Stop
                                </Button>
                                <Button
                                    onClick={() =>
                                        openConfirmModal(
                                            "Logout dari sesi WhatsApp? Anda perlu scan QR ulang.",
                                            handleLogout
                                        )
                                    }
                                    disabled={loading}
                                    className="bg-red-500/60 hover:bg-red-500/80 text-white border-white/30"
                                >
                                    Logout
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={fetchStatus}
                            disabled={loading}
                            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                        >
                            Refresh Status
                        </Button>
                    </div>
                </div>
            </div>

            {/* Webhook Indicator (read-only) */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Webhook
                </h2>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-600 dark:text-gray-400">Endpoint app</span>
                        <span className="font-mono text-gray-800 dark:text-gray-100">
                            {webhookInfo?.webhook_path ?? "/api/webhook/waha"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-600 dark:text-gray-400">HMAC</span>
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${webhookInfo?.hmac_enabled
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                                }`}
                        >
                            {webhookInfo?.hmac_enabled ? "Aktif" : "Nonaktif"}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Webhook per-session</span>
                        {webhookInfo && webhookInfo.session_webhooks.length > 0 ? (
                            <ul className="mt-2 space-y-2">
                                {webhookInfo.session_webhooks.map((wh, i) => (
                                    <li key={i} className="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                                        <p className="font-mono text-xs break-all text-gray-800 dark:text-gray-100">
                                            {wh.url}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            events: {wh.events?.join(", ") || "-"} · HMAC: {wh.hmac?.key ? "ya" : "tidak"}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Tidak ada konfigurasi per-session. Webhook diatur global via environment
                                di instance WAHA (tidak diekspos oleh API). Selama pesan masuk memicu OTP, berarti aktif.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Modal — copied from whatsapp.tsx */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="flex w-full justify-center">
                        <CiCircleAlert size={100} color="orange" />
                    </div>
                    <div className="flex-wrap justify-center text-gray-800 dark:text-gray-400">
                        <p className="w-full text-center text-2xl font-semibold">
                            Konfirmasi
                        </p>
                        <p className="w-full text-center">{confirmText}</p>
                    </div>
                    <div className="flex w-full justify-center space-x-4">
                        <button
                            onClick={() => {
                                confirmAction();
                                closeModal();
                            }}
                            className="mt-4 inline-flex items-center justify-center rounded-md bg-green-600 px-10 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                        >
                            Konfirmasi
                        </button>
                        <button
                            onClick={() => {
                                closeModal();
                            }}
                            className="mt-4 inline-flex items-center justify-center rounded-md bg-red-600 px-10 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WahaSessionPage;
