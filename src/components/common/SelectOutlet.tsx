"use client";
import { ChevronDownIcon, ChevronUpIcon } from "@/icons";
import React, { useEffect, useRef, useState } from "react";


type Outlet = {
  id: string;
  name: string;
};

interface SelectOutletProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  fetchUrl?: string;
  outlets?: Outlet[];
  placeholder?: string;
}

const SelectOutlet: React.FC<SelectOutletProps> = ({
  value,
  onChange,
  className = "",
  fetchUrl,
  outlets: outletsProp,
  placeholder = "Select outlet...",
}) => {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [filtered, setFiltered] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const ref = useRef<HTMLDivElement>(null);

  // ✅ Fetch outlet list
  useEffect(() => {
    const fetchOutlets = async () => {
      if (outletsProp && outletsProp.length > 0) {
        setOutlets(outletsProp);
        setFiltered(outletsProp);
        return;
      }
      if (!fetchUrl) return;

      setLoading(true);
      try {
        const response = await fetch(`${API_URL}${fetchUrl}`);
        const res = await response.json();
        const allOpt = { id: "", name: "All Outlet" };
        const mapped: Outlet[] = res.data.map((o: any) => ({
          id: o.id,
          name: o.name || o.outlet_name,
        }));
        const allOutletMapped = [allOpt, ...mapped];
        setOutlets(allOutletMapped);
        setFiltered(allOutletMapped);
      } catch (err) {
        console.error("Error fetching outlets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOutlets();
  }, [API_URL, fetchUrl, outletsProp]);

  // ✅ Filter saat mengetik
  useEffect(() => {
    const lower = query.toLowerCase();
    setFiltered(outlets.filter((o) => o.name.toLowerCase().includes(lower)));
  }, [query, outlets]);

  // ✅ Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const exactIndex = filtered.findIndex(
      (o) => o.name.toLowerCase() === query.trim().toLowerCase()
    );
    setHighlightIndex(exactIndex);
  }, [query, filtered]);


  // ✅ Navigasi keyboard
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) setOpen(true);

    if (e.key === "ArrowDown") {
      setHighlightIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      setHighlightIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();

      // Cek apakah input cocok dengan salah satu nama outlet
      const exactMatch = outlets.find(
        (o) => o.name.toLowerCase() === query.trim().toLowerCase()
      );

      if (highlightIndex >= 0) {
        handleSelect(filtered[highlightIndex].id);
      } else if (exactMatch) {
        handleSelect(exactMatch.id);
      } else {
        // ❗ Tidak ada match — kasih feedback atau tutup dropdown
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };


  const handleSelect = (id: string) => {
    const selected = outlets.find((o) => o.id === id);
    if (!selected) return;
    onChange?.(id);
    setQuery(selected.name);
    setOpen(false);
  };

  // ✅ Sinkronisasi value luar
  useEffect(() => {
    if (value && outlets.length > 0) {
      const selected = outlets.find((o) => o.id === value);
      if (selected) setQuery(selected.name);
    }
  }, [value, outlets]);

  return (
    <div
      ref={ref}
      className={`relative w-full text-gray-700 dark:text-gray-300 ${className}`}
    >
      {/* Input utama */}
      <div className="flex items-center rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500">
        {/* Ikon Search default */}
        <span className="ml-2 text-gray-400">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent px-2 py-2 text-sm outline-none dark:text-gray-200"
        />
        {/* Ikon kanan */}
        <span
          className={`
    mr-2 inline-block h-4 w-4 text-gray-400 transition-transform duration-300
    ${loading ? "animate-[spin_0.8s_linear_infinite]" : ""}
    ${open ? "rotate-180" : "rotate-0"}
  `}
        >
          <ChevronDownIcon />
        </span>

      </div>

      {/* Dropdown list */}
      {open && (
        <ul
          className="
            absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200
            bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 animate-in fade-in-50
          "
        >
          {loading ? (
            <li className="px-3 py-2 text-sm text-gray-500">Loading...</li>
          ) : filtered.length > 0 ? (
            filtered.map((outlet, index) => (
              <li
                key={outlet.id}
                onClick={() => handleSelect(outlet.id)}
                className={`cursor-pointer px-3 py-2 text-sm transition-colors ${index === highlightIndex
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                {outlet.name}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500">
              Tidak ada outlet ditemukan
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SelectOutlet;
