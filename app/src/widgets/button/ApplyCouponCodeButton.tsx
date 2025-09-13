import { useState } from "react";
import ApplyCouponCodeModal from "../modal/ApplyCouponCodeModal";

const ApplyCouponCodeButton = ({ title }: { title: string }) => {
    const [openModal, setOpenModal] = useState<boolean>(false);

    return (
        <div className="flex flex-row w-full justify-between items-end">
            <span className="font-amstel-thin w-full text-2xl sm:text-3xl text-start">{title}</span>
            <button className="z-10 flex items-center font-amstel-thin w-auto text-base sm:text-xl hover:scale-105 transition-all ease-in-out" onClick={() => setOpenModal(true)}>
                COUPON
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.1" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
            {openModal && <ApplyCouponCodeModal onClose={() => setOpenModal(false)}/>}
        </div>
    )
}

export default ApplyCouponCodeButton;