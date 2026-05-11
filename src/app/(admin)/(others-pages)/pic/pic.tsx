"use client";

import { PulseLoading } from "@/components/common/loading";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { RootState } from "@/store";
import { clearToken } from "@/store/slices/authSlices";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

type PicPayload = {
  name: string;
  phone_number: string;
  address: string;
  image: string;
};

const Pic: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const assetBaseUrl = API_URL?.split("/api")[0];

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [form, setForm] = useState<PicPayload>({
    name: "",
    phone_number: "",
    address: "",
    image: "",
  });

  const imagePreviewSrc = useMemo(() => {
    if (!form.image) return "";
    if (form.image.startsWith("data:")) return form.image;
    if (form.image.startsWith("/") && assetBaseUrl) return `${assetBaseUrl}${form.image}`;
    return form.image;
  }, [assetBaseUrl, form.image]);

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

  useEffect(() => {
    const fetchExisting = async () => {
      if (!auth.token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/partner/pic`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        });
        const res = await response.json();

        if (res?.statusCode === 200 && res?.data) {
          setForm({
            name: res.data?.name ?? "",
            phone_number: res.data?.phone_number ?? "",
            address: res.data?.address ?? "",
            image: res.data?.image ?? "",
          });
        } else {
          setForm((prev) => ({ ...prev, image: "" }));
        }
      } catch (error) {
        console.error("Error fetching PIC:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token]);

  const handleFileUpload = (file: File) => {
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format file harus JPG, PNG, atau WEBP");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!auth.token) return;

    setIsSubmitting(true);
    try {
      const payload: PicPayload = {
        name: form.name,
        phone_number: form.phone_number,
        address: form.address,
        image: form.image,
      };

      const response = await fetch(`${API_URL}/admin/partner/pic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });
      const res = await response.json();

      if (res?.statusCode === 200) {
        toast.success("PIC berhasil disimpan");
      } else {
        toast.warning(res?.err || "Gagal menyimpan PIC");
      }
    } catch (error) {
      console.error("Error saving PIC:", error);
      toast.error("Gagal menyimpan PIC");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <PulseLoading />;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="p-6 space-y-6">
        <div>
          <h5 className="mb-1 font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
            PIC
          </h5>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-5">
            <div>
              <Label>
                Name <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Ilham"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div>
              <Label>
                Phone Number <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="082110050655"
                value={form.phone_number}
                onChange={(e) => setForm((p) => ({ ...p, phone_number: e.target.value }))}
              />
            </div>

            <div>
              <Label>
                Address <span className="text-error-500">*</span>
              </Label>
              <TextArea
                rows={4}
                placeholder="Depok"
                value={form.address}
                onChange={(v) => setForm((p) => ({ ...p, address: v }))}
              />
            </div>

          </div>

          <div className="space-y-3">
            <Label>Image</Label>
            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.currentTarget.value = "";
                }}
              />

              <div className="flex flex-col md:flex-row gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Image
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, image: "" }))}
                >
                  Clear Image
                </Button>
              </div>

              {imagePreviewSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreviewSrc}
                  alt="PIC Preview"
                  className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-800"
                />
              ) : (
                <p className="text-xs text-gray-400">No image selected</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button size="sm" variant="primary" type="button" disabled={isSubmitting} onClick={submit}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pic;
