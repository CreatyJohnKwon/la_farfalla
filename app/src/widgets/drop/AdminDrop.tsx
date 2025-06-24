"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useProduct from "@src/shared/hooks/useProduct";

const AdminDrop = () => {
    const { setOpenSidebar } = useProduct();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="z-40">
            <button
                className="font-amstel"
                onClick={() => setOpen((prev) => !prev)}
            >
                admin
            </button>
            {open && (
                <ul
                    className={`font-amstel mt-2 overflow-hidden bg-transparent text-xl font-[300] sm:absolute sm:text-base ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"} `}
                >
                    <li key={"admin-orders"} className="py-1">
                        <button
                            onClick={() => {
                                router.push("/admin/list/orders");
                                setOpenSidebar(false);
                                setOpen(false);
                            }}
                        >
                            Order
                        </button>
                    </li>
                    <li key={"admin-products"} className="py-1">
                        <button
                            onClick={() => {
                                router.push("/admin/list/products");
                                setOpenSidebar(false);
                                setOpen(false);
                            }}
                        >
                            Product
                        </button>
                    </li>
                    <li key={"admin-users"} className="py-1">
                        <button
                            onClick={() => {
                                router.push("/admin/list/users");
                                setOpenSidebar(false);
                                setOpen(false);
                            }}
                        >
                            User
                        </button>
                    </li>
                    <li key={"admin-coupons"} className="py-1">
                        <button
                            onClick={() => {
                                router.push("/admin/list/coupons");
                                setOpenSidebar(false);
                                setOpen(false);
                            }}
                        >
                            Coupon
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
};

export default AdminDrop;
