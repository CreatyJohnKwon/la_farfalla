"use client";

import { useUserQuery, useUpdateUserMutation } from "@/src/shared/hooks/react-query/useUserQuery";
import { useState, useEffect } from "react";

const EditProfile = () => {
  const { data: user, isLoading } = useUserQuery();
  const updateUser = useUpdateUserMutation();

  const [form, setForm] = useState({
    name: "",
    address: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", address: user.address || "", password: "" });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    updateUser.mutate(form, {
      onSuccess: () => alert("프로필이 수정되었습니다."),
      onError: () => alert("수정 실패"),
    });
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col gap-6 w-4/5 h-full items-center justify-center font-pretendard">
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="이름"
        className="border p-2 rounded w-full"
      />
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="비밀번호 (변경 시만 입력)"
        className="border p-2 rounded w-full"
      />
      <input
        type="text"
        name="address"
        value={form.address}
        onChange={handleChange}
        placeholder="주소"
        className="border p-2 rounded w-full"
      />
      <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2 place-self-end"
      >
        저장
      </button>
    </div>
  );
};

export default EditProfile;
