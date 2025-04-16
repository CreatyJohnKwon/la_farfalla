"use client";

import { useState } from 'react';

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setUrl(data.url);
  };

  return (
    <div className="p-6 space-y-4">
      <input
        type="file"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] || null;
          setFile(selectedFile);
        }}
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        업로드
      </button>
      {url && (
        <div>
          ✅ 업로드 완료: <a href={url} target="_blank">{url}</a>
          <img src={url} alt="업로드된 이미지" className="mt-4 w-48" />
        </div>
      )}
    </div>
  );
}