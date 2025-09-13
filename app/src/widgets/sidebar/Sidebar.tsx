"use client";

import usePage from "@src/shared/hooks/usePage";
import DropdownMenu from "@src/widgets/drop/DropdownMenu";
import { useEffect } from "react";

const Sidebar = () => {
    const {
        menuData,
        menuTitle,
        isVisible,
        animationClass,
        isCategoryLoad,
        category,
        shopMenuItems,
        openSidebar,
        setIsVisible,
        setAnimationClass,
        onCloseSidebar
    } = usePage();

    useEffect(() => {
        if (openSidebar) {
            setIsVisible(true);
            setAnimationClass("animate-slide-in-left");
        } else {
            setAnimationClass("animate-slide-out-left");
            setTimeout(() => {
                setIsVisible(false);
            }, 500);
        }
    }, [openSidebar]);

    if (!isVisible) return null;

    return (
        !isCategoryLoad &&
        category && (
            // 검은 배경 (부모) - 애니메이션이 적용되지 않습니다.
            <div 
                className="fixed inset-0 z-50 bg-black/50"
                onClick={() => onCloseSidebar()}
            >
                {/* 흰색 사이드바 (자식) - 애니메이션만 적용됩니다. */}
                <div 
                    className={`fixed left-0 top-0 h-full w-[72vw] bg-white z-50 ${animationClass}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative flex h-full w-full flex-col items-center justify-center">
                        {/* 상단 UI (동일) */}
                        <button
                            className="absolute left-4 top-3 mt-0.5 text-2xl font-amstel font-[500] text-black"
                            onClick={() => onCloseSidebar()}
                        >
                            &times;
                        </button>
                        
                        {/* 메뉴 리스트 */}
                        <ul className="absolute top-48 flex flex-row items-start gap-12 text-center text-xl text-black">
                            <li className="relative">
                                <DropdownMenu 
                                    title="SHOP"
                                    items={shopMenuItems}
                                    triggerType="click"
                                />
                            </li>
                            <li className="relative">
                                <DropdownMenu 
                                    title={menuTitle}
                                    items={menuData}
                                    triggerType="click"
                                />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    );
};

export default Sidebar;