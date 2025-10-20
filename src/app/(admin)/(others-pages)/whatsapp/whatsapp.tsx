"use client";

import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { RootState } from "@/store";
import { clearToken } from "@/store/slices/authSlices";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CiCircleAlert } from "react-icons/ci";
import { TbDeviceDesktopCheck, TbDeviceDesktopX } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Image from "next/image";

// API URL

const WhatsAppSessionPage: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const auth = useSelector((state: RootState) => state.auth);
    const [refresh, setRefresh] = useState<boolean>(false)
    const [sessions, setSessions] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [qrImage, setQrImage] = useState<string | null>(null);
    const { isOpen, openModal, closeModal } = useModal();
    const [deleteFunction, setDeleteFunction] = useState<() => void>(
        () => () => { },
    );

    useEffect(() => {
        const now = Date.now() / 1000;
        let exp = true
        if (auth.user?.exp !== undefined) exp = now > auth.user?.exp
        if (auth.user?.role.name !== "super admin" || exp) {
            localStorage.clear()
            dispatch(clearToken())
            router.push("/signin")
            toast.warn("Your session has expired, please login!")
        } else {
            setRefresh(!refresh)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.token, router])

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch("/rubick/sessions/find/aerplus", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": "QBIT_A4gx18YGxKAvR01ClcHpcR7TjZUNtwvE",
                    },
                });
                const data = await response.json();
                if (data.success == true) {
                    setSessions(data.success)
                    toast.success(data.message);
                } else {
                    toast.warning(data.message);
                    setSessions(data.success)
                }
            } catch (error) {
                console.log(error);
                toast.error("Failed to check WhatsApp session");
            }
        };
        fetchSession();
    }, [auth.token, qrImage, isLoading])

    const handleDeleteSession = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/rubick/sessions/delete/aerplus`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": "QBIT_A4gx18YGxKAvR01ClcHpcR7TjZUNtwvE",
                },
            });
            const res = await response.json();
            if (res.success === true) {
                toast.success("Session deleted successfully");
            } else {
                toast.warning(res.message);
            }
        } catch (error) {
            toast.error("Failed to delete session");
            console.error("Error deleting session:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSession = async () => {
        try {
            const response = await fetch("/rubick/sessions/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    apikey: "QBIT_A4gx18YGxKAvR01ClcHpcR7TjZUNtwvE",
                },
                body: new URLSearchParams({
                    id: "aerplus",
                    typeAuth: "qr",
                }),
            });

            const result = await response.json();
            console.log(result);

            if (result.success && result.data?.qrcode) {
                // Langsung simpan base64 ke state (karena sudah dalam format data:image/png;base64,...)
                setQrImage(result.data.qrcode);
            } else {
                toast.warning(result.message + ` Delete the session and try again`);
                setQrImage(null);
            }
        } catch (error) {
            toast.error(`${error}`);
            setQrImage(null);
        }
    };


    return (

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br bg-blue-950 text-white shadow-2xl">
            {!qrImage && <div className="p-12 text-center space-y-6 justify-center">
                <h1 className="text-2xl font-bold text-blue-100">WhatsApp Session</h1>
                <p className="text-blue-100 text-sm">{sessions ? `Session active` : `Session not found`}</p>
                <div className="flex justify-center">

                    {sessions ? (
                        <TbDeviceDesktopCheck size={200} color={sessions ? "green" : "red"} />
                    ) : (
                        <TbDeviceDesktopX size={200} color={sessions ? "green" : "red"} />
                    )}
                </div>
                {
                    sessions ?
                        <Button
                            onClick={
                                () => {
                                    setDeleteFunction(() => () => handleDeleteSession())
                                    openModal()
                                }
                            }
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30 mt-4"
                        >
                            Delete Session
                        </Button>
                        :
                        <Button
                            onClick={handleCreateSession}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30 mt-4"
                        >
                            Create Session
                        </Button>
                }
            </div>}
            {qrImage && (
                <div className="p-12 text-center space-y-6">
                    <h1 className="text-2xl font-bold text-blue-100">WhatsApp Session</h1>
                    <p className="text-blue-100 text-sm">Scan the QR code</p>
                    <Image
                        src={qrImage}
                        alt="WhatsApp QR Code"
                        className="mx-auto w-72 h-72 border border-gray-300 shadow-md rounded-lg"
                        width={100}
                        height={100}
                    />
                    <Button
                        onClick={handleCreateSession}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 mt-4"
                    >
                        Create Session
                    </Button>
                </div>
            )}

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="flex w-full justify-center">
                        <CiCircleAlert size={100} color="orange" />
                    </div>
                    <div className="flex-wrap justify-center text-gray-800 dark:text-gray-400">
                        <p className="w-full text-center text-2xl font-semibold">
                            Are you sure?
                        </p>
                        <p className="w-full text-center">
                            To delete the WhatsApp session?
                        </p>
                    </div>
                    <div className="flex w-full justify-center space-x-4">
                        <button
                            onClick={() => {
                                deleteFunction();
                                closeModal();
                            }}
                            className="mt-4 inline-flex items-center justify-center rounded-md bg-green-600 px-10 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => {
                                closeModal();
                            }}
                            className="mt-4 inline-flex items-center justify-center rounded-md bg-red-600 px-10 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div>

    );
};

export default WhatsAppSessionPage;
