import Table from "@/components/user/reusable/DataTable";
import { addServiceApi } from "@/store/AdminSideApi/addServiceApi";
import { deleteServiceApi } from "@/store/AdminSideApi/deleteServiceApi";
import { fetchServicesApi } from "@/store/AdminSideApi/fetchServices";
import { useState, ChangeEvent, useEffect } from "react";

// Type definitions
interface Service {
  id: string;
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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: ''
  });

  // Validation errors state
  const [errors, setErrors] = useState<ValidationErrors>({
    name: '',
    description: ''
  });

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
              handleDelete(item);
            }}
            disabled={deletingServiceId === item.id}
            className={`text-sm flex items-center space-x-1 ${
              deletingServiceId === item.id 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-red-600 hover:text-red-800'
            }`}
          >
            {deletingServiceId === item.id ? (
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

  const handleFetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchServicesApi();
      console.log('fetch services response', response);

      if (response && response.result && response.result.services) {
        // Format dates for display
        const formattedServices = response.result.services.map(service => ({
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
    setIsModalOpen(true);
    setErrors({ name: '', description: '' });
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
    } else if (services.some(service => 
      service.name.toLowerCase() === formData.name.trim().toLowerCase()
    )) {
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

  // Handle form submission
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    const newService = {
      name: formData.name.trim(),
      description: formData.description.trim()
    };

    try {
      const savedService = await addServiceApi(newService);
      console.log('Service API response:', savedService);

      if (savedService && savedService.result && savedService.result.success) {
        // Refresh the services list after successful addition
        await handleFetchServices();
        
        // Reset form
        setFormData({ name: "", description: "" });
        setErrors({ name: "", description: "" });
        setIsModalOpen(false);

        console.log("Service added successfully:", savedService);
      }
    } catch (error) {
      console.error("Failed to add service:", error);
      setError("Failed to add service. Please try again.");
    }
  };

  // Handle modal close
  const handleCloseModal = (): void => {
    setFormData({ name: '', description: '' });
    setErrors({ name: '', description: '' });
    setIsModalOpen(false);
  };

  // Handle row click
  const handleRowClick = (service: Service): void => {
    console.log('Service clicked:', service);
  };

  const handleDelete = async (service: Service): Promise<void> => {
    try {
      // Set loading state for this specific service
      setDeletingServiceId(service.id);
      
      const res = await deleteServiceApi({ serviceId: service.id });
      console.log('Deleting service with Id', res);

      if (res.result.success) {
        // Stop loading and remove the deleted service from the table
        setDeletingServiceId(null);
        setServices(services.filter(s => s.id !== service.id));
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

      {/* Services Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Total services: <span className="font-semibold">{services.length}</span>
        </p>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {services.length > 0 ? (
          <Table
            data={services}
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
      </div>

      {/* Add Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Add New Service</h2>
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
                  Add Service
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