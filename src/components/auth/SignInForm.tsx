"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { RootState } from "@/store";
import { setToken } from "@/store/slices/authSlices";
import { useFormik } from 'formik';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export default function SignInForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {

    if (auth.token !== null) {
      router.push("/")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  
  const formikReg = useFormik({
    initialValues: {
      phone_number: "",
      password: ""
    },
    validationSchema: Yup.object({
      phone_number: Yup.string().required('Wajib diisi'),
      password: Yup.string().min(6, 'Minimal 6 karakter').required('Wajib diisi'),
    }),
    onSubmit: async (values) => {
      // console.log(values);

      try {
        const response = await fetch(`${API_URL}admin/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        const res = await response.json();
        //console.log(res.data);
        if (res.statusCode == 200) {
          // localStorage.setItem("token", res.data.accessToken.token)
          dispatch(setToken(res.data.accessToken.token));
          toast.success("Signin success!")
          router.push("/")
        } else {
          toast.error(`Signin failed! ${res.err}`)
        }
      } catch (error) {
        console.error("Error to login:", error);
      }
    }
  })
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your phone number and password to sign in!
            </p>
          </div>
          <div>
            <form>
              <div className="space-y-6">
                <div>
                  <Label>
                    Phone Number <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    name="phone_number"
                    type="text"
                    placeholder="08567890987"
                    value={formikReg.values.phone_number}
                    onChange={formikReg.handleChange} />
                  {formikReg.touched.phone_number && formikReg.errors.phone_number ? (
                    <div style={{ color: 'red' }}>{formikReg.errors.phone_number}</div>
                  ) : null}
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formikReg.values.password}
                      onChange={formikReg.handleChange} />
                    {formikReg.touched.password && formikReg.errors.password ? (
                      <div style={{ color: 'red' }}>{formikReg.errors.password}</div>
                    ) : null}
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div> */}
                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="sm"
                    onClick={formikReg.handleSubmit}
                  >
                    Sign in
                  </Button>
                </div>
              </div>
            </form>

            {/* <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

