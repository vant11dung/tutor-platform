'use client';

import { useState } from 'react';

interface CertificateViewerProps {
  certificates: string[];
}

export default function CertificateViewer({ certificates }: CertificateViewerProps) {
  const [selectedCert, setSelectedCert] = useState<string | null>(null);

  if (!certificates || certificates.length === 0) return null;

  return (
    <>
      {/* --- KHỐI BẰNG CẤP & CHỨNG CHỈ --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3 pb-4 border-b border-gray-100">
          <span className="bg-orange-100 text-orange-600 p-2 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          Bằng cấp & Chứng chỉ minh chứng
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {certificates.map((src: string, idx: number) => (
            <div 
              key={idx} 
              className="relative rounded-xl overflow-hidden h-32 border border-gray-200 shadow-sm hover:scale-105 hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => setSelectedCert(src)} // Lưu ảnh vào state khi click
            >
              <img src={src} className="w-full h-full object-cover" alt={`Certificate ${idx + 1}`} />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- KHỐI MODAL PHÓNG TO ẢNH --- */}
      {selectedCert && (
        <div 
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300"
          onClick={() => setSelectedCert(null)} // Click ra ngoài để đóng
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-transparent p-2 flex flex-col items-center">
            {/* Nút đóng */}
            <button 
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full backdrop-blur-md transition-all duration-200"
              onClick={() => setSelectedCert(null)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Ảnh phóng to */}
            <img 
              src={selectedCert} 
              alt="Chứng chỉ phóng to" 
              className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()} // Chặn đóng khi click vào ảnh
            />
          </div>
        </div>
      )}
    </>
  );
}