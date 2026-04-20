"use client";

import React, { useCallback, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { useLibraryStore } from '@/store/useLibraryStore'; // Updated to match likely real store path

// Maximum file size: 20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'application/pdf', 
  'image/jpeg', 
  'image/png', 
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];

interface MaterialUploaderProps {
  onUploadComplete?: (fileUrl: string, fileName: string, mimeType: string) => void;
}

export default function MaterialUploader({ onUploadComplete }: MaterialUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Note: Using useLibraryStore as identified in previous analysis
  const { addMaterial } = useLibraryStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setErrorMsg(null);
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMsg(`Unsupported file type: ${file.name}. Only PDF, JPG, PNG, and DOCX are supported.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(`File too large: ${file.name}. Maximum size is 20MB.`);
      return;
    }

    try {
      setIsUploading(true);
      setProgress(5);

      // 특수문자나 공백이 URL 인코딩 되면서 Token Signature Mismatch (403/가짜 CORS) 발생 방지
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

      // 디버깅: 업로드할 원본 파일 객체의 무결성 검증 로깅
      console.log(`[MaterialUploader] Initiating upload for file: ${safeFilename}`);
      console.log(`[MaterialUploader] File info: size=${file.size} bytes (${(file.size/1024/1024).toFixed(2)}MB), type=${file.type}`);
      if (!file || file.size === 0) {
        throw new Error('File object is empty or corrupted.');
      }

      // Vercel SDK 백그라운드 멀티파트 업로드 (타임아웃은 SDK 자체 및 브라우저망 설정에 위임)
      const newBlob = await upload(`materials/${Date.now()}-${safeFilename}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round(progressEvent.percentage);
          setProgress((prev) => {
            // 반응성을 줄이기 위해 이전 대비 5% 이상 진행되었거나 완료되었을 때만 렌더링
            if (percentage - prev >= 5 || percentage === 100) {
              return percentage;
            }
            return prev;
          });
        }
      }) as any;
      
      setProgress(100);

      const newSourceFile = {
        id: newBlob.url,
        title: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 'text',
        url: newBlob.url,
        createdAt: new Date().toISOString()
      };

      await addMaterial(newSourceFile);

      if (onUploadComplete) {
         onUploadComplete(newBlob.url, file.name, file.type);
      }
      
    } catch (err: any) {
      console.error('[MaterialUploader] Error:', err);
      
      // [임시 디버깅용 핫픽스] 에러 사유를 브라우저 팝업으로 강제로 띄웁니다.
      alert(`[Vercel Blob 에러 사유]: ${err.message}`);

      // 에러 메시지 한글화 및 상세화
      let userFriendlyMsg = err.message;
      if (err.message.includes('400')) userFriendlyMsg = '업로드 요청이 거부되었습니다. 파일 형식을 확인해주세요.';
      if (err.message.includes('500')) userFriendlyMsg = '서버 설정 오류입니다. 관리자(대표님)에게 문의해주세요.';
      if (err.message.includes('timed out')) userFriendlyMsg = '업로드 시간이 초과되었습니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.';
      
      setErrorMsg(`업로드 실패: ${userFriendlyMsg}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 animate-[fadeIn_0.5s_ease_both]">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileUpload')?.click()}
        className={`glass-card p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden group
          ${isDragging ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' : 'border-border/60 hover:border-indigo-500/50 hover:bg-slate-800/30'}
        `}
      >
        <input 
          id="fileUpload" 
          type="file" 
          className="hidden" 
          onChange={handleFileChange} 
          accept=".pdf,.jpg,.jpeg,.png,.webp,.docx"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4 w-full px-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center animate-pulse mb-2 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              <span className="material-symbols-outlined text-white text-3xl animate-spin">sync</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Uploading Material...</h3>
            
            {/* Progress Bar with Real Progress */}
            <div className="w-full h-2 bg-slate-800 rounded-full mt-4 overflow-hidden relative">
               <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" 
                style={{ width: `${progress}%` }}
               />
            </div>
            <span className="text-xs font-bold text-indigo-400 mt-1">{progress}% Complete</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl border border-slate-700">
              <span className="material-symbols-outlined text-4xl text-indigo-400">cloud_upload</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Upload Study Material</h3>
            <p className="text-slate-400 mb-6 font-medium">Drag & drop your PDF, DOCX, or images here</p>
            <div className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-slate-900 rounded-full text-slate-300 border border-slate-800 shadow-md">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
              Up to 20MB supported
            </div>
          </div>
        )}

      </div>

      {errorMsg && (
        <div className="mt-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 animate-[fadeIn_0.3s_ease_both]">
           <span className="material-symbols-outlined shrink-0 text-xl">error</span>
           <span className="text-sm font-medium leading-tight">{errorMsg}</span>
        </div>
      )}
    </div>
  );
}