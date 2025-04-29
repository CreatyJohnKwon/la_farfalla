import { useState } from "react";

const ProfileHeader = () => {
    const [isBlurred, setIsBlurred] = useState(true);

    const editProfileHandler = () => {
        const isConfirmed = window.confirm("정보를 수정하시겠습니까?");
        if (isConfirmed) {
          setIsBlurred(false);
        }
      };

    return (
        <div className="relative flex flex-row w-full h-full items-center justify-center">
            <div className={`${isBlurred ? "blur-sm bg-white/30" : ""} transition-all duration-500`}>
                <div className="flex flex-col items-start space-y-4 text-xl">
                    {/* 유저 이미지 */}
                    <div className="flex flex-col">
                    <label>프로필 이미지</label>
                    <input type="file" className="mt-2" />
                    </div>
        
                    {/* 유저 이름 */}
                    <div className="flex flex-col">
                    <label>이름</label>
                    <input
                        type="text"
                        className="mt-2 rounded border border-gray-300 p-2"
                        placeholder="이름을 입력하세요"
                    />
                    </div>
        
                    {/* 비밀번호 */}
                    <div className="flex flex-col">
                    <label>비밀번호</label>
                    <input
                        type="password"
                        className="mt-2 rounded border border-gray-300 p-2"
                        placeholder="새 비밀번호를 입력하세요"
                    />
                    </div>
        
                    {/* 주소 */}
                    <div className="flex flex-col">
                    <label>주소</label>
                    <input
                        type="text"
                        className="mt-2 rounded border border-gray-300 p-2"
                        placeholder="주소를 입력하세요"
                    />
                    </div>
                </div>
            </div>
  
          {/* 수정 시작 버튼 */}
          {isBlurred && (
            <button
              className="absolute bg-gray-300 px-6 py-3 text-2xl text-black shadow-md transition-all duration-300 hover:bg-black hover:text-white"
              onClick={editProfileHandler}
            >
              정보 수정
            </button>
          )}
        </div>
      );
};

export default ProfileHeader;
