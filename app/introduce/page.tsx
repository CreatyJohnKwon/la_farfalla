"use client";

import { RxInstagramLogo } from "react-icons/rx";

const Introduce = () => {
  const instagramHandler = () =>
    window.open(
      "https://www.instagram.com/lafarfalla____?igsh=aHdsM3EzNzk1bDh5&utm_source=qr",
      "la_farfalla_instagram",
    );

  return (
    <div className="m-5 flex h-screen flex-col items-center justify-center c_md:m-0">
      <div className="items-start">
        <h1 className="font-brand mb-20 text-3xl c_base:text-7xl">
          La fafalla's Vision
        </h1>

        <div className="font-light c_base:text-3xl">
          <span className="font-brand mt-2">La fafalla </span>
          <span>는 미래지향적이고 모던한 감각을 지닌 여성 브랜드로</span>
          <p className="mt-2">
            일상적이면서도 세련된 디자인을 통해 현대 여성들의 다양한
            라이프스타일을 반영합니다
          </p>
          <p className="mt-2">
            이 브랜드는 기능성과 미적 요소를 조화롭게 결합하여
          </p>
          <p className="mt-2">
            착용자에게 편안함과 자신감을 동시에 선사하는 것을 목표로 합니다
          </p>
        </div>

        <button
          className="mt-20 flex h-auto w-auto flex-row items-center justify-start"
          onClick={() => instagramHandler()}
        >
          <RxInstagramLogo className="h-7 w-auto" />
          <span className="ms-2 border-black font-thin hover:border-b">
            LA_FARALLA{" "}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Introduce;
