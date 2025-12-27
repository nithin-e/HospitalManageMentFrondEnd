import React, { useEffect, useMemo, useState } from 'react';
import { Check, Search, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserfetchingDoctors } from '../../store/userSideApi/UserfetchingDoctors';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface Doctor {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  specialty?: string;
  profileImageUrl?: string;
  qualifications?: string;
  medicalLicenseNumber?: string;
  isActive?: boolean;
}

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook }) => {
  const { 
    firstName = '', 
    lastName = '', 
    specialty = 'General Practice', 
    profileImageUrl = '',      
    qualifications = '',
    medicalLicenseNumber = '',
    isActive = false
  } = doctor || {};

  const fullName = `Dr. ${firstName} ${lastName}`.trim();
  const displayName = fullName.length > 4 ? fullName : 'Doctor';

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 sm:p-6 relative overflow-hidden group border border-gray-200 h-full flex flex-col">
      {isActive && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-green-100 rounded-full p-1 sm:p-1.5 z-10">
          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
        </div>
      )}
      
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: 'rgb(0, 59, 115)' }}></div>
      
      <div className="flex flex-col items-center flex-1">
        <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-3 sm:mb-4 border-2 sm:border-4 border-gray-100 shadow-md group-hover:border-blue-200 transition-colors">
          {profileImageUrl ? (
            <img 
              src={profileImageUrl} 
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const nextEl = target.nextSibling as HTMLElement;
                if (nextEl) {
                  nextEl.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div 
            className={`w-full h-full flex items-center justify-center ${profileImageUrl ? 'hidden' : 'flex'}`}
            style={{ backgroundColor: 'rgba(0, 59, 115, 0.1)' }}
          >
            <User className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16" style={{ color: 'rgb(0, 59, 115)' }} />
          </div>
        </div>
        
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-1 text-center line-clamp-1">
          {displayName}
        </h3>
        
        <p className="font-medium text-sm sm:text-base mb-2 text-center line-clamp-1" style={{ color: 'rgb(0, 59, 115)' }}>
          {specialty}
        </p>
        
        {qualifications && (
          <p className="text-xs sm:text-sm text-gray-500 mb-3 text-center line-clamp-2 flex-1">
            {qualifications}
          </p>
        )}
        
        {medicalLicenseNumber && (
          <p className="text-xs text-gray-400 mb-3 sm:mb-4 line-clamp-1">
            License: {medicalLicenseNumber.substring(0, 10)}...
          </p>
        )}
        
        <div className="w-10 sm:w-12 h-1 rounded-full mb-3 sm:mb-4" style={{ backgroundColor: 'rgb(0, 59, 115)' }}></div>

        <div className="w-full flex items-center justify-center gap-2">
          <button
            onClick={() => onBook(doctor)}
            className="px-3 py-2 sm:px-4 sm:py-2 text-white rounded-lg font-medium shadow-sm hover:opacity-90 transition-all text-sm sm:text-base w-full"
            style={{ backgroundColor: 'rgb(0, 59, 115)' }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

const DoctorListing: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [sort, setSort] = useState<string>('name-asc');
  const perPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const loadDoctors = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await UserfetchingDoctors();
        
        if (!mounted) return;
        
        let doctorData: Doctor[] = [];
        
        if (response?.data?.data?.data) {
          doctorData = response.data.data.data;
        } else if (response?.data?.data) {
          doctorData = response.data.data;
        } else if (response?.data) {
          doctorData = response.data;
        } else if (Array.isArray(response)) {
          doctorData = response;
        }
        
        if (!Array.isArray(doctorData)) {
          doctorData = [];
        }
        
        setDoctors(doctorData);
        setFiltered(doctorData);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        if (mounted) {
          setError('Failed to fetch doctors. Please try again later.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadDoctors();
    
    return () => { 
      mounted = false; 
    };
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();
    
    if (!query) {
      setFiltered(doctors);
      setPage(1);
      return;
    }
    
    const filteredDoctors = doctors.filter((doctor) => {
      const firstName = (doctor.firstName || '').toLowerCase();
      const lastName = (doctor.lastName || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      const specialty = (doctor.specialty || '').toLowerCase();
      const qualifications = (doctor.qualifications || '').toLowerCase();
      
      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        fullName.includes(query) ||
        specialty.includes(query) ||
        qualifications.includes(query)
      );
    });
    
    setFiltered(filteredDoctors);
    setPage(1);
  }, [search, doctors]);

  const sortedFiltered = useMemo(() => {
    const items = Array.isArray(filtered) ? [...filtered] : [];

    switch (sort) {
      case 'name-asc':
        return items.sort((a, b) => {
          const aName = `${(a.firstName || '')} ${(a.lastName || '')}`.trim().toLowerCase();
          const bName = `${(b.firstName || '')} ${(b.lastName || '')}`.trim().toLowerCase();
          return aName.localeCompare(bName);
        });
      case 'name-desc':
        return items.sort((a, b) => {
          const aName = `${(a.firstName || '')} ${(a.lastName || '')}`.trim().toLowerCase();
          const bName = `${(b.firstName || '')} ${(b.lastName || '')}`.trim().toLowerCase();
          return bName.localeCompare(aName);
        });
      case 'specialty-asc':
        return items.sort((a, b) => ((a.specialty || '')).toLowerCase().localeCompare(((b.specialty || '')).toLowerCase()));
      case 'specialty-desc':
        return items.sort((a, b) => ((b.specialty || '')).toLowerCase().localeCompare(((a.specialty || '')).toLowerCase()));
      case 'active-first':
        return items.sort((a, b) => Number(b.isActive === true) - Number(a.isActive === true));
      default:
        return items;
    }
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / perPage));
  const start = (page - 1) * perPage;
  const pageItems = sortedFiltered.slice(start, start + perPage);

  const handleBook = (doctor: Doctor) => {
    navigate('/AppointMent', { state: { doctor } });
  };

  return (
    <>
      <Navbar/>
      <div className="min-h-screen pt-16 sm:pt-20 bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12 pt-4">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3" style={{ color: 'rgb(0, 59, 115)' }}>
              Our Medical Experts
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl">
              Meet our team of experienced healthcare professionals
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex-1 max-w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or specialty..."
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-sm sm:text-base"
                  style={{ 
                    '--tw-ring-opacity': '0.5',
                    '--tw-ring-color': 'rgb(0, 59, 115)'
                  } as React.CSSProperties}
                />
              </div>
            </div>
            
            {/* Sort Dropdown for Mobile */}
            <div className="sm:hidden">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 text-sm"
                style={{ 
                  '--tw-ring-opacity': '0.5',
                  '--tw-ring-color': 'rgb(0, 59, 115)'
                } as React.CSSProperties}
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="specialty-asc">Specialty A-Z</option>
                <option value="specialty-desc">Specialty Z-A</option>
                <option value="active-first">Active First</option>
              </select>
            </div>

            {/* Sort Options for Desktop */}
            <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="text-gray-600 text-sm font-medium mr-2">Sort by:</span>
              <div className="flex gap-1">
                {['name-asc', 'specialty-asc', 'active-first'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSort(option)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      sort === option 
                        ? 'text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    style={sort === option ? { backgroundColor: 'rgb(0, 59, 115)' } : {}}
                  >
                    {option === 'name-asc' && 'Name'}
                    {option === 'specialty-asc' && 'Specialty'}
                    {option === 'active-first' && 'Active'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs sm:text-sm text-gray-600 font-medium bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-sm border border-gray-200 whitespace-nowrap">
              Page {page} of {totalPages} • {filtered.length} doctor{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 sm:py-20">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2" style={{ borderColor: 'rgb(0, 59, 115)' }}></div>
              <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading doctors...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 max-w-md mx-auto">
                <p className="text-red-600 font-medium text-sm sm:text-base">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all"
                  style={{ backgroundColor: 'rgb(0, 59, 115)' }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && pageItems.length === 0 && (
            <div className="text-center py-12 sm:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 59, 115, 0.1)' }}>
                <User className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'rgb(0, 59, 115)' }} />
              </div>
              <p className="text-gray-600 text-base sm:text-lg">
                {search ? 'No doctors found matching your search.' : 'No doctors available at the moment.'}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 px-4 py-2 font-medium hover:opacity-80 transition-opacity text-sm sm:text-base"
                  style={{ color: 'rgb(0, 59, 115)' }}
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Doctors Grid */}
          {!loading && !error && pageItems.length > 0 && (
            <>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                {pageItems.map((doctor) => (
                  <DoctorCard 
                    key={doctor.id || doctor._id} 
                    doctor={doctor} 
                    onBook={handleBook}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Showing {start + 1}-{Math.min(start + perPage, filtered.length)} of {filtered.length} doctors
                </div>
                
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow text-sm sm:text-base"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden xs:inline">Previous</span>
                  </button>
                  
                  {/* Mobile Page Indicator */}
                  <div className="xs:hidden px-4 py-2 text-white rounded-lg font-medium shadow-sm text-sm" style={{ backgroundColor: 'rgb(0, 59, 115)' }}>
                    {page} / {totalPages}
                  </div>
                  
                  {/* Desktop Page Numbers */}
                  <div className="hidden xs:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-all ${
                            page === pageNum
                              ? 'text-white shadow-sm'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          style={page === pageNum ? { backgroundColor: 'rgb(0, 59, 115)' } : {}}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && page < totalPages - 2 && (
                      <>
                        <span className="text-gray-400">...</span>
                        <button
                          onClick={() => setPage(totalPages)}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow text-sm sm:text-base"
                  >
                    <span className="hidden xs:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default DoctorListing;