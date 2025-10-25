import Table from "@/components/user/reusable/DataTable";
import { addServiceApi } from "@/store/AdminSideApi/addServiceApi";
import { deleteServiceApi } from "@/store/AdminSideApi/deleteServiceApi";
import { editServiceApi } from "@/store/AdminSideApi/editServiceApi";
import { fetchServicesApi } from "@/store/AdminSideApi/fetchServices";

import { useState, ChangeEvent, useEffect, useMemo } from "react";

// Type definitions
interface Service {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface ServiceFormData {
  name: string;
  description: string;
}

interface ValidationErrors {
  name: string;
  description: string;
}

interface FetchServicesResponse {
  services: Service[];
  success: boolean;
  message: string;
}

// Services Admin Component
const ServicesAdmin: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: ''
  });

  // Validation errors state
  const [errors, setErrors] = useState<ValidationErrors>({
    name: '',
    description: ''
  });

  // Calculate pagination values
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const showPagination = services.length > itemsPerPage;

  // Get current page data
  const currentServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return services.slice(startIndex, endIndex);
  }, [services, currentPage, itemsPerPage]);

  const columns = [
    { key: 'name', label: 'Service Name' },
    { key: 'description', label: 'Description' },
    { key: 'createdAt', label: 'Created Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, item: Service) => (
        <div className="flex space-x-2">
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              handleEdit(item);
            }}
            disabled={editingServiceId === item._id || deletingServiceId === item._id}
            className={`text-sm flex items-center space-x-1 ${
              editingServiceId === item._id || deletingServiceId === item._id
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            {editingServiceId === item._id ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent"></div>
                <span>Editing...</span>
              </>
            ) : (
              <span>Edit</span>
            )}
          </button>
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              handleDelete(item);
            }}
            disabled={deletingServiceId === item._id || editingServiceId === item._id}
            className={`text-sm flex items-center space-x-1 ${
              deletingServiceId === item._id || editingServiceId === item._id
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-red-600 hover:text-red-800'
            }`}
          >
            {deletingServiceId === item._id ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      )
    }
  ];

  useEffect(() => {
    handleFetchServices();
  }, []);

  // Reset to first page when services change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [services.length, currentPage, totalPages]);

  const handleFetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchServicesApi();
      console.log('fetch services response', response);

      if (response && response.data ) {
        // Format dates for display
        const formattedServices = response.data.map(service => ({
          ...service,
          createdAt: formatDateForDisplay(service.createdAt),
          updatedAt: formatDateForDisplay(service.updatedAt)
        }));
        
        setServices(formattedServices);
      } else {
        setError('No services found or invalid response format');
      }
    } catch (error) {
      console.error('Fetch services failed', error);
      setError('Failed to fetch services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  const handleAddService = (): void => {
    setIsEditMode(false);
    setFormData({ name: '', description: '' });
    setErrors({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service): void => {
    setIsEditMode(true);
    console.log('id is correct or not',service)
    setEditingServiceId(service._id);
    setFormData({
      name: service.name,
      description: service.description
    });
    setErrors({ name: '', description: '' });
    setIsModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      name: '',
      description: ''
    };

    // Validate service name
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Service name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Service name must be at least 2 characters';
    } else if (
      services.some(service => 
        service.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        (!isEditMode || service._id !== editingServiceId)
      )
    ) {
      newErrors.name = 'Service name already exists';
    }

    // Validate description
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).every(key => !newErrors[key as keyof ValidationErrors]);
  };

 // Replace your handleSubmit function with this corrected version:

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) {
    return;
  }

  const serviceData = {
    name: formData.name.trim(),
    description: formData.description.trim()
  };

  try {
    if (isEditMode && editingServiceId) {
   
      
      const response = await editServiceApi(editingServiceId, serviceData);
      console.log('Edit Service API response:', response);

      if (response && response.success) {
        
        const formattedDate = formatDateForDisplay(new Date().toISOString());
        
       
        const updatedServices = services.map(service => 
          service._id === editingServiceId 
            ? { 
                ...service, 
                name: serviceData.name, 
                description: serviceData.description,
                updatedAt: formattedDate 
              }
            : service
        );
        
        setServices(updatedServices);
        setEditingServiceId(null);
        setIsModalOpen(false);
        setFormData({ name: "", description: "" });
        setErrors({ name: "", description: "" });
        
        console.log("Service updated successfully");
      } else {
        // Handle failed update
        setError('Failed to update service. Please try again.');
        console.error('Update failed:', response);
      }
    } else {
      // Add new service
      const savedService = await addServiceApi(serviceData);
      console.log('Add Service API response:', savedService);

      if (savedService && savedService.success) {
        // Refresh the services list after successful addition
        await handleFetchServices();
        
        // Reset form
        setFormData({ name: "", description: "" });
        setErrors({ name: "", description: "" });
        setIsModalOpen(false);

        console.log("Service added successfully");
      } else {
        setError('Failed to add service. Please try again.');
      }
    }
  } catch (error) {
    console.error("Failed to save service:", error);
    setError(`Failed to ${isEditMode ? 'update' : 'add'} service. Please try again.`);
  } finally {
    // Always clear the editing state
    setEditingServiceId(null);
  }
};

  // Handle modal close
  const handleCloseModal = (): void => {
    setFormData({ name: '', description: '' });
    setErrors({ name: '', description: '' });
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingServiceId(null);
  };

  // Handle row click
  const handleRowClick = (service: Service): void => {
    console.log('Service clicked:', service)
  };

  const handleDelete = async (service: Service): Promise<void> => {
    try {
  
      setDeletingServiceId(service._id);
      
      const res = await deleteServiceApi({ serviceId: service._id });
      

      if (res.success) {
       
        setDeletingServiceId(null);
        const updatedServices = services.filter(s => s._id !== service._id);
        setServices(updatedServices);

        // Adjust current page if necessary
        const newTotalPages = Math.ceil(updatedServices.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } else {
        // If deletion failed, show error and stop loading
        setDeletingServiceId(null);
        setError("Failed to delete service. Please try again.");
      }
      
    } catch (error) {
      console.error("Error deleting service:", error);
      setError("Failed to delete service. Please try again.");
    } finally {
      // Ensure loading state is always cleared
      setDeletingServiceId(null);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handlePreviousPage = (): void => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = (): void => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Generate page numbers for pagination
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={handleFetchServices}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-600 mt-2">Manage hospital services and specializations</p>
        </div>
        
        {/* Add Service Button */}
        <button
          onClick={handleAddService}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Service</span>
        </button>
      </div>

    
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          Total services: <span className="font-semibold">{services.length}</span>
          {showPagination && (
            <span className="ml-4">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, services.length)} of {services.length}
            </span>
          )}
        </p>
        
        {showPagination && (
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

    
      <div className="bg-white rounded-lg shadow-sm">
        {services.length > 0 ? (
          <Table
            data={currentServices}
            columns={columns}
            sortable={true}
            onRowClick={handleRowClick}
            emptyMessage="No services found"
            className="rounded-lg"
          />
        ) : (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No services yet</h3>
            <p className="mt-2 text-gray-500">Get started by adding your first service.</p>
            <button
              onClick={handleAddService}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Add Your First Service
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {showPagination && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditMode ? 'Edit Service' : 'Add New Service'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              <div className="space-y-4">
                {/* Service Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.name 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="e.g., Neurology, Cardiology"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                      errors.description 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Brief description of the service"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  {isEditMode ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesAdmin;