import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Filter, ChevronDown, ArrowUpDown, Shield, User, Briefcase, Clock, X, ChevronLeft, ChevronRight, Loader2, RefreshCw, ChevronUp, Eye, Edit, Download, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/docui/avatar";
import { Input } from "@/components/ui/docui/input";
import { Button } from "@/components/ui/docui/button";
import { doctorPaginationApi } from "@/store/AdminSideApi/doctorPaginationApi";
import { deleteDoctor } from "@/store/AdminSideApi/deleteDoctorAfterRejection";
import { cn } from "@/lib/utils";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const DoctorsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [approvedDoctors, setApprovedDoctors] = useState(0);
  const [pendingDoctors, setPendingDoctors] = useState(0);
  const [declinedDoctors, setDeclinedDoctors] = useState(0);
  const [doctorsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [medicalLicenseUrl, setMedicalLicenseUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const debouncedSearchTerm = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (location.state?.rejectedDoctor && location.state?.rejectedDoctorEmail) {
      const email = location.state?.rejectedDoctorEmail;
      removeRejectedDoctor(email);
    }
  }, [location.state]);

  const removeRejectedDoctor = async (email) => {
    try {
      setDoctors(prevDoctors => prevDoctors.filter(doctor => doctor.email !== email));
      const response = await deleteDoctor(email);
    } catch (error) {
      console.error("Error removing rejected doctor:", error);
      fetchDoctorData(currentPage);
    }
  };

  useEffect(() => {
    setCurrentPage(1); 
    fetchDoctorData(1);
  }, [statusFilter, sortField, sortDirection]);

  useEffect(() => {
    if (searchQuery !== debouncedSearchTerm && searchQuery.trim()) {
      setSearchLoading(true);
    } else {
      setSearchLoading(false);
      fetchDoctorData(currentPage);
    }
  }, [debouncedSearchTerm, currentPage]);

  const fetchDoctorData = async (page = 1) => {
    try {
      if (page === 1 && !searchLoading) {
        setLoading(true);
      } else {
        setSearchLoading(true);
      }
      
      setError(null);

      const params = new URLSearchParams();

      if (debouncedSearchTerm.trim()) {
        params.append('searchQuery', debouncedSearchTerm.trim());
      }
      
      if (statusFilter !== "all") {
        params.append('status', statusFilter.toLowerCase());
      }
      
      params.append('sortBy', sortField);
      params.append('sortDirection', sortDirection);
      params.append('page', page.toString());
      params.append('limit', doctorsPerPage.toString());

      const response = await doctorPaginationApi(params);
      const responseData = response.data.data;
      
      if (!responseData || !responseData.success) {
        throw new Error(responseData?.message || "Failed to fetch doctors");
      }

      const { doctors: doctorData, totalCount, approvedCount, pendingCount, declinedCount } = responseData;

      // Transform data
      const transformedDoctors = doctorData.map(doctor => ({
        id: doctor.id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        phoneNumber: doctor.phoneNumber,
        specialty: doctor.specialty || "General Practice",
        qualifications: doctor.qualifications,
        licenseNumber: doctor.licenseNumber,
        medicalLicenseNumber: doctor.medicalLicenseNumber,
        medicalLicenseUrl: doctor.medicalLicenseUrl,
        profileImageUrl: doctor.profileImageUrl,
        status: doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1),
        agreeTerms: doctor.agreeTerms,
        createdAt: doctor.createdAt,
        formattedDate: new Date(doctor.createdAt).toLocaleDateString(),
        isActive: doctor.isActive
      }));

      setDoctors(transformedDoctors);
      setTotalDoctors(totalCount || 0);
      setApprovedDoctors(approvedCount || 0);
      setPendingDoctors(pendingCount || 0);
      setDeclinedDoctors(declinedCount || 0);
      setCurrentPage(page);
      
      const calculatedPages = Math.ceil((totalCount || 0) / doctorsPerPage);
      setTotalPages(calculatedPages || 1);

    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError(error.message || "Failed to load doctors. Please try again.");
      setDoctors([]);
      setTotalDoctors(0);
      setApprovedDoctors(0);
      setPendingDoctors(0);
      setDeclinedDoctors(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Medical License Modal Functions
  const openMedicalLicenseModal = (doctor) => {
    setCurrentDoctor(doctor);
    setMedicalLicenseUrl(doctor.medicalLicenseUrl || "");
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDoctor(null);
    setMedicalLicenseUrl("");
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (!currentDoctor || !medicalLicenseUrl.trim()) return;

    try {
      // Here you would typically call an API to update the medical license URL
      // For now, we'll update the local state
      setDoctors(prevDoctors =>
        prevDoctors.map(doctor =>
          doctor.id === currentDoctor.id
            ? { ...doctor, medicalLicenseUrl }
            : doctor
        )
      );

      // If you have an API endpoint for updating medical license:
      // await updateMedicalLicenseApi(currentDoctor.id, medicalLicenseUrl);
      
      setIsEditing(false);
      // Optionally show a success message
    } catch (error) {
      console.error("Error updating medical license:", error);
      // Handle error (show error message)
    }
  };

  const handleCancelEdit = () => {
    setMedicalLicenseUrl(currentDoctor?.medicalLicenseUrl || "");
    setIsEditing(false);
  };

  const handleDownloadLicense = () => {
    if (!medicalLicenseUrl) return;
    
    const link = document.createElement('a');
    link.href = medicalLicenseUrl;
    link.download = `medical_license_${currentDoctor?.medicalLicenseNumber || currentDoctor?.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image (JPEG, PNG, GIF) or PDF file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // In a real application, you would upload the file to your server
      // and get back a URL. For now, we'll create a local URL.
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setMedicalLicenseUrl(dataUrl);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
      alert('Error uploading file. Please try again.');
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchDoctorData(currentPage);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const getStatusIconAndColor = (status) => {
    switch (status) {
      case "Approved":
        return { 
          color: "text-emerald-500", 
          bgColor: "bg-emerald-50", 
          borderColor: "border-emerald-200",
          icon: <Shield className="w-4 h-4 text-emerald-500" />
        };
      case "Pending":
        return { 
          color: "text-amber-500", 
          bgColor: "bg-amber-50", 
          borderColor: "border-amber-200",
          icon: <Clock className="w-4 h-4 text-amber-500" />
        };
      case "Declined":
        return { 
          color: "text-rose-500", 
          bgColor: "bg-rose-50", 
          borderColor: "border-rose-200", 
          icon: <X className="w-4 h-4 text-rose-500" />
        };
      default:
        return { 
          color: "text-gray-500", 
          bgColor: "bg-gray-50", 
          borderColor: "border-gray-200",
          icon: <User className="w-4 h-4 text-gray-500" />
        };
    }
  };

  const handleDoctorClick = (doctor) => {
    navigate(`/adminDetails/${doctor.id}`, { state: { doctor } });
  };

  // Generate pagination buttons
  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading || searchLoading}
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        {pageNumbers.map((page) => (
          <Button
            key={page}
            onClick={() => handlePageChange(page)}
            className={cn(
              "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg min-w-[40px]",
              currentPage === page && "bg-blue-100 text-blue-700 border-blue-300"
            )}
            disabled={loading || searchLoading}
          >
            {page}
          </Button>
        ))}
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading || searchLoading}
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Professionals Directory</h1>
          <p className="text-gray-500">Manage and review doctor registrations</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh}
            disabled={loading || searchLoading}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw size={18} className={(loading || searchLoading) ? "animate-spin" : ""} />
            <span className="hidden md:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Doctors</p>
              <p className="text-3xl font-bold mt-1 text-gray-800">{totalDoctors}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold mt-1 text-gray-800">{approvedDoctors}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold mt-1 text-gray-800">{pendingDoctors}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Declined</p>
              <p className="text-3xl font-bold mt-1 text-gray-800">{declinedDoctors}</p>
            </div>
            <div className="bg-rose-100 p-3 rounded-lg">
              <X className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search by name, specialty, or email"
            className="pl-10 pr-10 py-6 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 rounded-xl shadow-sm w-full"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            </div>
          )}
          
          {searchQuery && !searchLoading && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xl"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-6 px-4 rounded-xl shadow-sm flex items-center gap-2"
          >
            <Filter size={18} />
            <span>Filters</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          
          <Button 
            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-6 px-4 rounded-xl shadow-sm flex items-center gap-2"
          >
            {sortDirection === "desc" ? "Newest First" : "Oldest First"}
            {sortDirection === "desc" ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </Button>
        </div>
      </div>

      {/* Search feedback */}
      {debouncedSearchTerm && (
        <div className="mb-4 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
          {searchLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching for "{searchQuery}"...
            </span>
          ) : (
            <span>
              {doctors.length > 0 
                ? `Found ${totalDoctors} doctor(s) matching "${debouncedSearchTerm}"`
                : `No doctors found for "${debouncedSearchTerm}"`
              }
            </span>
          )}
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
          <div className="font-medium mb-2 text-gray-700">Filter by Status</div>
          <div className="flex flex-wrap gap-2">
            {["all", "Approved", "Pending", "Declined"].map(status => {
              const isActive = statusFilter === status;
              const { color, bgColor } = status !== "all" ? getStatusIconAndColor(status) : { color: "text-gray-600", bgColor: "bg-gray-50" };
              return (
                <Button 
                  key={status}
                  onClick={() => handleStatusFilterChange(status)}
                  className={cn(
                    "rounded-full px-4 py-1 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? `${bgColor} ${color} ring-2 ring-offset-2 ring-blue-300` 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {status === "all" ? "All Doctors" : status}
                  {isActive && <span className="ml-2">✓</span>}
                </Button>
              );
            })}
            
            {(statusFilter !== "all" || searchQuery) && (
              <Button 
                onClick={clearAllFilters}
                className="bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-full px-4 py-1 text-sm"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col justify-center items-center p-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="relative w-20 h-20 mb-4">
            <div className="absolute top-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading doctor data...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 p-8 rounded-xl border border-red-100 text-center shadow-sm">
          <div className="text-red-600 font-medium mb-2">{error}</div>
          <Button
            onClick={handleRefresh}
            className="bg-white text-red-600 border border-red-200 hover:bg-red-50 mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* No results */}
      {!loading && !error && doctors.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-md border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No doctors found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? `No results for "${debouncedSearchTerm}"` 
              : "No doctors match your current filter criteria"
            }
          </p>
          <Button 
            onClick={clearAllFilters} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && doctors.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="grid grid-cols-12 p-4 bg-gray-50 font-medium border-b border-gray-200">
            <div 
              className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => toggleSort("name")}
            >
              Doctor
              <ArrowUpDown className="h-4 w-4" />
              {sortField === "name" && (
                <span className="text-xs text-gray-500 ml-1">
                  {sortDirection === "asc" ? "A-Z" : "Z-A"}
                </span>
              )}
            </div>
            <div 
              className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => toggleSort("specialty")}
            >
              Specialty
              <ArrowUpDown className="h-4 w-4" />
              {sortField === "specialty" && (
                <span className="text-xs text-gray-500 ml-1">
                  {sortDirection === "asc" ? "A-Z" : "Z-A"}
                </span>
              )}
            </div>
            <div className="col-span-2 text-center">Status</div>
            <div 
              className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => toggleSort("createdAt")}
            >
              Registered
              <ArrowUpDown className="h-4 w-4" />
              {sortField === "createdAt" && (
                <span className="text-xs text-gray-500 ml-1">
                  {sortDirection === "asc" ? "Oldest" : "Newest"}
                </span>
              )}
            </div>
            <div className="col-span-2 text-center">Medical License</div>
          </div>

          {/* Doctor rows */}
          <div className="divide-y divide-gray-100">
            {doctors.map((doctor) => {
              const { color, bgColor, borderColor, icon } = getStatusIconAndColor(doctor.status);
              
              return (
                <div
                  key={doctor.id}
                  className="grid grid-cols-12 items-center p-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                  onClick={() => handleDoctorClick(doctor)}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <Avatar className="h-12 w-12 rounded-full shadow-sm">
                      <AvatarImage src={doctor.profileImageUrl} alt={doctor.name} />
                      <AvatarFallback className="bg-gray-100 text-blue-600">
                        {doctor.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">
                        {doctor.name}
                        {doctor.status === "Declined" && (
                          <span className="ml-2 text-sm font-medium text-rose-600 bg-rose-50 py-0.5 px-2 rounded-full">
                            Application rejected
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500 text-sm">{doctor.email}</div>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                      </span>
                      <span className="text-gray-700">{doctor.specialty}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex justify-center">
                    <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${bgColor} ${borderColor} border`}>
                      {icon}
                      <span className={`text-sm font-medium ${color}`}>{doctor.status}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-sm text-gray-500">
                    {doctor.formattedDate}
                  </div>
                  
                  <div className="col-span-2 flex justify-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openMedicalLicenseModal(doctor);
                      }}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-2"
                      size="sm"
                    >
                      <Eye className="w-4 h-4" />
                      View License
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && doctors.length > 0 && totalPages > 1 && renderPagination()}
      
      {/* Results info */}
      {!loading && !error && doctors.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {((currentPage - 1) * doctorsPerPage) + 1} to {Math.min(currentPage * doctorsPerPage, totalDoctors)} of {totalDoctors} doctors
          {debouncedSearchTerm && ` (filtered results)`}
        </div>
      )}

      {/* Medical License Modal */}
      {isModalOpen && currentDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Medical License</h2>
                <p className="text-gray-600 mt-1">
                  {currentDoctor.name} • {currentDoctor.specialty}
                </p>
                {currentDoctor.medicalLicenseNumber && (
                  <p className="text-gray-500 text-sm mt-1">
                    License #: {currentDoctor.medicalLicenseNumber}
                  </p>
                )}
              </div>
              <Button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
                variant="ghost"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column - License Preview */}
                <div className="lg:w-2/3">
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    {medicalLicenseUrl ? (
                      <div className="relative">
                        {medicalLicenseUrl.toLowerCase().endsWith('.pdf') ? (
                          <div className="h-96 flex flex-col items-center justify-center p-8">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                              <span className="text-red-600 font-bold text-2xl">PDF</span>
                            </div>
                            <p className="text-gray-700 font-medium mb-2">Medical License PDF Document</p>
                            <p className="text-gray-500 text-sm">Click download to view the PDF file</p>
                          </div>
                        ) : (
                          <img
                            src={medicalLicenseUrl}
                            alt="Medical License"
                            className="w-full h-auto object-contain max-h-96"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/600x400?text=Image+Not+Available";
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="h-96 flex flex-col items-center justify-center p-8">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                          <User className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-700 font-medium mb-2">No Medical License Uploaded</p>
                        <p className="text-gray-500 text-sm text-center">
                          This doctor hasn't uploaded their medical license yet
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {medicalLicenseUrl && (
                      <Button
                        onClick={handleDownloadLicense}
                        className="bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download License
                      </Button>
                    )}
                    
                    {!isEditing && (
                      <Button
                        onClick={handleEditClick}
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit License
                      </Button>
                    )}
                  </div>
                </div>

                {/* Right Column - Edit Form */}
                <div className="lg:w-1/3">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-medium text-gray-900 mb-3">
                      {isEditing ? "Edit Medical License" : "License Information"}
                    </h3>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            License URL
                          </label>
                          <Input
                            type="text"
                            value={medicalLicenseUrl}
                            onChange={(e) => setMedicalLicenseUrl(e.target.value)}
                            placeholder="Enter license URL"
                            className="w-full"
                          />
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload New License
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                            <input
                              type="file"
                              id="license-upload"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={handleFileUpload}
                              disabled={isUploading}
                            />
                            <label htmlFor="license-upload" className="cursor-pointer">
                              {isUploading ? (
                                <div className="flex flex-col items-center">
                                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                  <p className="text-sm text-gray-600">Uploading...</p>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">
                                    Click to upload or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, GIF up to 5MB or PDF
                                  </p>
                                </>
                              )}
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={handleSaveClick}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!medicalLicenseUrl.trim() || isUploading}
                          >
                            Save Changes
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">License Status</p>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mt-1 ${
                            medicalLicenseUrl ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {medicalLicenseUrl ? (
                              <>
                                <Shield className="w-4 h-4" />
                                <span className="font-medium">Uploaded</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">Pending</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {medicalLicenseUrl && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Current License URL</p>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 overflow-x-auto">
                              <code className="text-xs text-gray-700 break-all">
                                {medicalLicenseUrl}
                              </code>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-4">
                          <p className="text-sm text-gray-500 mb-3">
                            To edit the medical license, click the "Edit License" button.
                          </p>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p>• Supported formats: JPG, PNG, GIF, PDF</p>
                            <p>• Maximum file size: 5MB</p>
                            <p>• Make sure the license is valid and readable</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(currentDoctor.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={closeModal}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    variant="outline"
                  >
                    Close
                  </Button>
                  {!isEditing && medicalLicenseUrl && (
                    <Button
                      onClick={handleDownloadLicense}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download License
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;