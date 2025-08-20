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
}

const SelectOutlet: React.FC<SelectOutletProps> = ({
  onChange,
  className = "",
  fetchUrl,
  outlets: outletsProp,
}) => {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [filteredOutlets, setFilteredOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outletsProp && outletsProp.length > 0) {
      setOutlets(outletsProp);
      setFilteredOutlets(outletsProp);
      return;
    }

    if (fetchUrl) {
      setLoading(true);
      const fetchOutlets = async () => {
        try {
          const response = await fetch(`${API_URL}${fetchUrl}`);
          const res = await response.json();
          const allOpt = { id: "", name: "All Outlet" }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped: Outlet[] = res.data.map((o: any) => ({
            id: o.id,
            name: o.name || o.outlet_name,
          }));

          const allOutletMapped = [allOpt, ...mapped];

          setOutlets(allOutletMapped);
          setFilteredOutlets(allOutletMapped);
        } catch (error) {
          console.error("Error fetching outlets:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchOutlets();
    }
  }, [API_URL, fetchUrl, outletsProp]);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredOutlets(outlets.filter((o) => o.name.toLowerCase().includes(lower)));
  }, [search, outlets]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (id: string) => {
    onChange?.(id);
    const selected = outlets.find((o) => o.id === id);
    setSearch(selected ? selected.name : "");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className} text-gray-500 dark:text-gray-400`}>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Filter by Outlet"
        className="
          w-full
          rounded-lg border border-stroke
          bg-white p-3
          dark:bg-gray-dark
          text-sm outline-none
          focus:border-primary focus:ring-1 focus:ring-primary
          dark:border-gray-800 dark:bg-boxdark
          text-gray-500 dark:text-gray-400
        "
      />
      {open && (
        <ul
          className="
            absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-stroke
            bg-white dark:bg-gray-dark dark:border-strokedark dark:bg-boxdark
          "
        >
          {loading ? (
            <li className="px-3 py-2 text-sm text-gray-500">loading...</li>
          ) : filteredOutlets.length > 0 ? (
            filteredOutlets.map((outlet) => (
              <li
                key={outlet.id}
                onClick={() => handleSelect(outlet.id)}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {outlet.name}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500">Tidak ditemukan</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SelectOutlet;
