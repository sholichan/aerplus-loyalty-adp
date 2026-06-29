"use client";

import { PulseLoading } from "@/components/common/loading";
import Button from "@/components/ui/button/Button";
import { RootState } from "@/store";
import { clearToken } from "@/store/slices/authSlices";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";

type PartnerOutletDto = {
  id: number;
  name: string;
  ktp?: string | null;
  npwp?: string | null;
  address?: string | null;
  phone?: string | null;
  partner_start?: string | null;
  partner_end?: string | null;
};

type PartnerGrouped = {
  name: string;
  outlets: PartnerOutletDto[];
};

type UserDto = {
  id: string;
  user_name: string;
  phone_number: string;
  address?: string | null;
  is_active: boolean;
  created_at: string;
  outlet?: { id: number; name: string } | null;
};

const AssignPartner: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partners, setPartners] = useState<PartnerGrouped[]>([]);
  const [selectedPartnerName, setSelectedPartnerName] = useState<string>("");
  const [selectedOutletIds, setSelectedOutletIds] = useState<number[]>([]);

  const [userSearch, setUserSearch] = useState<string>("");
  const [userResults, setUserResults] = useState<UserDto[]>([]);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userBoxRef = useRef<HTMLDivElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  

  useEffect(() => {
    const fetchPartnerGrouped = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/partner/grouped-by-name`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const res = await response.json();
        if (res.statusCode === 200) {
          setPartners(res.data || []);
        } else {
          toast.error(res.err || "Failed to load partners");
        }
      } catch (error) {
        console.error("Error fetching partners:", error);
        toast.error("Failed to load partners");
      } finally {
        setIsLoading(false);
      }
    };

    if (auth.token) fetchPartnerGrouped();
  }, [API_URL, auth.token]);

  const selectedPartner = useMemo(
    () => partners.find((p) => p.name === selectedPartnerName) || null,
    [partners, selectedPartnerName]
  );

  const outlets = selectedPartner?.outlets || [];

  useEffect(() => {
    setSelectedOutletIds([]);
  }, [selectedPartnerName]);

  const toggleOutlet = (outletId: number) => {
    setSelectedOutletIds((prev) =>
      prev.includes(outletId) ? prev.filter((id) => id !== outletId) : [...prev, outletId]
    );
  };

  const selectedUser = useMemo(
    () => userResults.find((u) => u.id === selectedUserId) || null,
    [selectedUserId, userResults]
  );

  const canSubmit = selectedUserId && selectedPartnerName && selectedOutletIds.length > 0 && !isSubmitting;

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!userBoxRef.current) return;
      if (!userBoxRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!auth.token) return;
    const q = userSearch.trim();
    if (!isUserDropdownOpen) return;
    if (q.length < 1) {
      setUserResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingUser(true);
        const response = await fetch(
          `${API_URL}/admin/user/get-all?page=1&limit=10&search=${encodeURIComponent(q)}`,
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
          setUserResults(res.data?.users || []);
        } else {
          toast.error(res.err || "Failed to search user");
        }
      } catch (error) {
        console.error("Error searching user:", error);
        toast.error("Failed to search user");
      } finally {
        setIsSearchingUser(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [API_URL, auth.token, isUserDropdownOpen, userSearch]);

  const selectUser = (u: UserDto) => {
    setSelectedUserId(u.id);
    setUserSearch(`${u.user_name} (${u.phone_number})`);
    setIsUserDropdownOpen(false);
  };

  const submitAssign = async () => {
    if (!selectedUserId) {
      toast.error("User must be selected");
      return;
    }
    if (!selectedPartnerName) {
      toast.error("Partner must be selected");
      return;
    }
    if (selectedOutletIds.length < 1) {
      toast.error("At least one outlet must be selected");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/admin/partner/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          user_id: selectedUserId,
          partner_name: selectedPartnerName,
          outlet_ids: selectedOutletIds,
        }),
      });

      const res = await response.json();
      if (res.statusCode === 200) {
        toast.success("Partner assigned successfully!");
        setSelectedOutletIds([]);
        router.push("/partner")
      } else {
        toast.error(res.err || "Failed to assign partner");
      }
    } catch (error) {
      console.error("Error assigning partner:", error);
      toast.error("Failed to assign partner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ddmmmyyyConvert = (isoString: string) => {
    return dayjs(isoString, 'YYYY-MM-DD').format('DD/MM/YYYY');
  }

  if (isLoading) return <PulseLoading />;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end md:gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select user
          </label>
          <div ref={userBoxRef} className="relative">
            <input
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setSelectedUserId("");
                setIsUserDropdownOpen(true);
              }}
              onFocus={() => setIsUserDropdownOpen(true)}
              placeholder="Ketik nama / phone..."
              className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
            />

            {isUserDropdownOpen && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
                <div className="max-h-64 overflow-auto">
                  {isSearchingUser && (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Searching...
                    </div>
                  )}
                  {!isSearchingUser && userSearch.trim().length < 1 && (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Ketik untuk mencari user
                    </div>
                  )}
                  {!isSearchingUser && userSearch.trim().length >= 1 && userResults.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      User tidak ditemukan
                    </div>
                  )}

                  {userResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => selectUser(u)}
                      className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {u.user_name} ({u.phone_number})
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Outlet: {u.outlet?.name || "-"} • Active: {u.is_active ? "Yes" : "No"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 min-h-[16px] text-xs text-gray-500 dark:text-gray-400">
            {selectedUser ? `Selected: ${selectedUser.user_name} (${selectedUser.phone_number})` : ""}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select partner
          </label>
          <select
            value={selectedPartnerName}
            onChange={(e) => setSelectedPartnerName(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="">-- select partner --</option>
            {partners.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="mt-2 min-h-[16px] text-xs text-gray-500 dark:text-gray-400">
            {selectedPartnerName ? `Selected: ${selectedPartnerName}` : ""}
          </div>
        </div>

        <div className="flex gap-2 md:justify-end">
          <Button size="sm" disabled={!canSubmit} onClick={submitAssign}>
            {isSubmitting ? "Saving..." : "Submit"}
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-[1102px] w-full divide-y divide-gray-100 dark:divide-white/[0.05]">
            <thead className="border-b border-gray-100 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
              <tr className="capitalize">
                {["", "Name", "Start Date", "End Date", "Phone Number", "Address"].map((h) => (
                  <th
                    key={h}
                    className="p-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05] bg-white dark:bg-white/[0.03]">
              {selectedPartnerName && outlets.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                    No data
                  </td>
                </tr>
              )}
              {!selectedPartnerName && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                    Select a partner to view the outlets
                  </td>
                </tr>
              )}
              {outlets.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedOutletIds.includes(o.id)}
                      onChange={() => toggleOutlet(o.id)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                  </td>
                  <td className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">{o.name || "-"}</td>
                  <td className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">{ddmmmyyyConvert(o.partner_start as string) || "-"}</td>
                  <td className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">{ddmmmyyyConvert(o.partner_end as string) || "-"}</td>
                  <td className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">{o.phone || "-"}</td>
                  <td className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">{o.address || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignPartner;
