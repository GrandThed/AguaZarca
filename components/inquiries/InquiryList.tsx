'use client';

import { useState } from 'react';
import { useInquiries } from '@/hooks/useInquiries';
import { Inquiry } from '@/types/api';
// import InquiryCard from './InquiryCard';
// import InquiryFilters from './InquiryFilters';
import Pagination from '../ui/Pagination';
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaCheck,
  FaDownload,
} from 'react-icons/fa';
import { exportInquiries } from '@/lib/api-client';
import { toast } from 'react-toastify';

export default function InquiryList() {
  const {
    inquiries,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    setPage,
    markMultipleAsRead,
    refetch,
  } = useInquiries();

  const [selectedInquiries, setSelectedInquiries] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleSelectAll = () => {
    if (selectedInquiries.length === inquiries.length) {
      setSelectedInquiries([]);
    } else {
      setSelectedInquiries(inquiries.map(inquiry => inquiry.id));
    }
  };

  const handleSelectInquiry = (inquiryId: string) => {
    setSelectedInquiries(prev =>
      prev.includes(inquiryId)
        ? prev.filter(id => id !== inquiryId)
        : [...prev, inquiryId]
    );
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedInquiries.length === 0) return;

    try {
      setBulkLoading(true);
      await markMultipleAsRead(selectedInquiries);
      setSelectedInquiries([]);
      toast.success(`${selectedInquiries.length} consultas marcadas como leídas`);
    } catch (error: any) {
      toast.error(error.message || 'Error al marcar como leídas');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportInquiries();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consultas-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Exportación completada');
    } catch (error: any) {
      toast.error(error.message || 'Error al exportar');
    }
  };

  const unreadCount = inquiries.filter(inquiry => !inquiry.read).length;

  if (loading && inquiries.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <InquiryFilters
        filters={filters}
        onFiltersChange={updateFilters}
      /> */}

      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Consultas
              </h2>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {pagination.total} total
                </span>
                {unreadCount > 0 && (
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                    {unreadCount} sin leer
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {selectedInquiries.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedInquiries.length} seleccionadas
                  </span>
                  <button
                    onClick={handleMarkSelectedAsRead}
                    disabled={bulkLoading}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm flex items-center gap-1"
                  >
                    <FaCheck />
                    Marcar como leídas
                  </button>
                </div>
              )}
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <FaDownload />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {inquiries.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedInquiries.length === inquiries.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Seleccionar todas en esta página
              </span>
            </label>
          </div>
        )}

        {/* Inquiry List */}
        <div className="divide-y divide-gray-200">
          {inquiries.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FaEnvelope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay consultas
              </h3>
              <p className="text-gray-500">
                Las consultas aparecerán aquí cuando los usuarios se pongan en contacto.
              </p>
            </div>
          ) : (
            inquiries.map((inquiry) => (
              <div key={inquiry.id} className="p-4 border-b">
                <p>Inquiry from {inquiry.name} - {inquiry.email}</p>
                <p>{inquiry.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}