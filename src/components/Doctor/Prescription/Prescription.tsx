import React, { useState } from 'react';
import { Stethoscope, X } from 'lucide-react';

const PrescriptionModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSubmit = () => {
    closeModal();
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <div>
     

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full mx-auto bg-white shadow-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-500 text-white p-3 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-6 h-6" />
                <div>
                  <h1 className="text-lg font-bold">Dr. Doctor Name</h1>
                  <p className="text-xs opacity-90">QUALIFICATION</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-semibold">HOSPITAL</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-3 border-b-2 border-blue-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Patient Name:
                    </label>
                    <div className="border-b border-gray-400 pb-1 h-4"></div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Address:
                    </label>
                    <div className="border-b border-gray-400 pb-1 mb-1 h-3"></div>
                    <div className="border-b border-gray-400 pb-1 h-3"></div>
                  </div>
                </div>
                <div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date:
                    </label>
                    <div className="border-b border-gray-400 pb-1 h-4"></div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Diagnosis:
                    </label>
                    <div className="border-b border-gray-400 pb-1 h-4"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative p-4 min-h-48">
              <div className="absolute top-2 left-4">
                <div className="text-4xl font-bold text-blue-400 opacity-80">
                  Rx
                </div>
              </div>
              <div className="pt-12">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="border-b border-gray-200 mb-3 pb-1 h-3"></div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-blue-500 text-white p-3 relative">
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-1">
                    <span>📞</span>
                    <span>00 00 000 00</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>📧</span>
                    <span>name@example.com</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center space-x-1">
                    <span>📍</span>
                    <span>Address Here Number St</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>🌐</span>
                    <span>www.website.com</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-1 right-2 opacity-20">
                <Stethoscope className="w-8 h-8" />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-4 bg-gray-50 rounded-b-lg">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionModal;