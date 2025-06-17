import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Filter, ChevronDown, ArrowUpDown, Shield, User, Briefcase, Clock, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/user/ui/docui/avatar";
import { Input } from "@/components/user/ui/docui/input";
import { Button } from "@/components/user/ui/docui/button";
import { fetchDoctors } from "@/store/AdminSideApi/fechDoctors";
import { deleteDoctor } from "@/store/AdminSideApi/deleteDoctorAfterRejection";

export const DoctorsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeFilters, setActiveFilters] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchDoctorData();
  }, []);

  // Handle rejected doctor state from navigation
  useEffect(() => {
    if (location.state?.rejectedDoctor && location.state?.rejectedDoctorEmail) {
      const email = location.state?.rejectedDoctorEmail;
      console.log('Found rejected doctor with email:', email);
      
      // Remove doctor immediately
      removeRejectedDoctor(email);
    }
  }, [location.state]);

  const removeRejectedDoctor = async (email) => {
    try {
      console.log('Removing doctor with email:', email);
      
      // Remove doctor from the UI immediately
      setDoctors(prevDoctors => prevDoctors.filter(doctor => doctor.email !== email));
      
      console.log('Making API call to delete doctor with email:', email);
      const response = await deleteDoctor(email);
      console.log('API response:', response);
      
      console.log(`Doctor with email ${email} successfully removed`);
    } catch (error) {
      console.error("Error removing rejected doctor:", error);
      // If the API call fails, refresh the data
      fetchDoctorData();
    }
  };

  

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const response = await fetchDoctors();
      console.log('doctor listing table', response);
      
      let doctorData = [];
      if (Array.isArray(response)) {
        doctorData = response;
      } else if (response && typeof response === "object") {
        const possibleArrayKeys = ["doctors", "data", "items", "results"];
        for (const key of possibleArrayKeys) {
          if (Array.isArray(response[key])) {
            doctorData = response[key];
            break;
          }
        }
      }

      doctorData = doctorData.map(doctor => ({
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
        status: doctor.status || "Pending",
        agreeTerms: doctor.agreeTerms,
        createdAt: new Date(doctor.createdAt).toLocaleDateString(),
      }));

      setDoctors(doctorData);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError("Failed to load doctors. Please try again.");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };


  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleFilter = (filter) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setSearchQuery("");
  };

  const sortedAndFilteredDoctors = () => {
    if (!Array.isArray(doctors)) return [];
    
    // Filter
    let filtered = doctors.filter(doctor => {
      const matchesSearch = searchQuery === "" || 
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.specialty && doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doctor.email && doctor.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Status filters
      const matchesStatusFilters = activeFilters.length === 0 || 
        activeFilters.includes(doctor.status);
      
      return matchesSearch && matchesStatusFilters;
    });
    
    // Sort
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "specialty") {
        comparison = (a.specialty || "").localeCompare(b.specialty || "");
      } else if (sortField === "createdAt") {
        // comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
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

  const filteredDoctors = sortedAndFilteredDoctors();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Professionals Directory</h1>
        <p className="text-gray-500">Manage and review doctor registrations</p>
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
            className="pl-10 py-6 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 rounded-xl shadow-sm w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {["Approved", "Pending", "Declined"].map(status => {
            const isActive = activeFilters.includes(status);
            const { color, bgColor } = getStatusIconAndColor(status);
            return (
              <Button 
                key={status}
                onClick={() => toggleFilter(status)}
                className={`font-medium transition-all duration-200 ${
                  isActive 
                    ? `${bgColor} ${color} ring-2 ring-offset-2 ring-blue-300` 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                } border border-gray-200 rounded-lg px-4 py-6`}
              >
                {status}
                {isActive && <span className="ml-2">✓</span>}
              </Button>
            );
          })}
          
          {activeFilters.length > 0 && (
            <Button 
              onClick={clearFilters}
              className="bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-lg px-4 py-6"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center p-16">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-100">
          <div className="text-rose-500 text-lg font-medium mb-3">{error}</div>
          <p className="text-gray-500 mb-4">Unable to load doctor information at this time.</p>
          <Button 
            onClick={fetchDoctorData} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </Button>
        </div>
      )}

      {/* No results */}
      {!loading && !error && filteredDoctors.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-md border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No doctors found</h3>
          <p className="text-gray-500 mb-6">No doctors match your current search or filter criteria.</p>
          <Button onClick={clearFilters} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && filteredDoctors.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          
          <div className="grid grid-cols-12 p-4 bg-gray-50 font-medium border-b border-gray-200">
            <div 
              className="col-span-5 flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => toggleSort("name")}
            >
              Doctor
              <ArrowUpDown className="h-4 w-4" />
            </div>
            <div 
              className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => toggleSort("specialty")}
            >
              Specialty
              <ArrowUpDown className="h-4 w-4" />
            </div>
            <div className="col-span-2 text-center">Status</div>
            <div 
              className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => toggleSort("createdAt")}
            >
              Registered
              <ArrowUpDown className="h-4 w-4" />
            </div>
          </div>

          {/* Doctor rows */}
          <div className="divide-y divide-gray-100">
            {filteredDoctors.map((doctor) => {
              const { color, bgColor, borderColor, icon } = getStatusIconAndColor(doctor.status);
              
              return (
                <div
                  key={doctor.id}
                  className="grid grid-cols-12 items-center p-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                  onClick={() => handleDoctorClick(doctor)}
                >
                  <div className="col-span-5 flex items-center gap-3">
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
                  
                  <div className="col-span-3">
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
                    {doctor.createdAt}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination placeholder */}
          <div className="p-4 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredDoctors.length} of {doctors.length} doctors
            </div>
            <div className="flex gap-2">
              <Button className="border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 px-4 py-2 rounded">
                Previous
              </Button>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;