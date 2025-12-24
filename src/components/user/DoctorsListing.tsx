import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { UserfetchingDoctors } from '../../store/userSideApi/UserfetchingDoctors';

const DoctorCard = ({ name, specialty, image, verified }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 relative">
      {verified && (
        <div className="absolute top-4 right-4 bg-green-100 rounded-full p-1.5">
          <Check className="w-4 h-4 text-green-600" />
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-gray-100">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-1">
          {name}
        </h3>
        
        <p className="text-gray-500 mb-4">
          {specialty}
        </p>
        
        <div className="w-12 h-1 bg-cyan-400 rounded-full"></div>
      </div>
    </div>
  );
};

const DoctorListing = () => {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await UserfetchingDoctors();
        console.log('checkc this responce while the fecting doctor tyme',res.data.data);
        
        if (!mounted) return;
        const data = Array.isArray(res) ? res : res.data.data ?? res.data.data ?? [];
        setDoctors(data.data.data);
        setFiltered(data);
      } catch (err) {
        setError('Failed to fetch doctors');
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered(doctors);
      setPage(1);
      return;
    }
    const f = doctors.filter((d) => {
      const name = (d.name || '').toLowerCase();
      const specialty = (d.specialty || '').toLowerCase();
      return name.includes(q) || specialty.includes(q);
    });
    setFiltered(f);
    setPage(1);
  }, [search, doctors]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const start = (page - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Our Medical Experts</h1>
          <p className="text-gray-600 text-lg">Meet our team of experienced healthcare professionals</p>
        </div>

        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex-1 max-w-md">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialty"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 shadow-sm focus:outline-none"
            />
          </div>
          <div className="text-sm text-gray-600">Page {page} / {totalPages}</div>
        </div>

        {loading && <div className="text-center py-12">Loading doctors...</div>}
        {error && <div className="text-center py-6 text-red-600">{error}</div>}

        {!loading && pageItems.length === 0 && (
          <div className="text-center py-12 text-gray-600">No doctors found.</div>
        )}

        <div className="space-y-8">
          {pageItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pageItems.map((doctor) => (
                <DoctorCard key={doctor.id} {...doctor} />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 bg-white border rounded-md disabled:opacity-50"
          >
            Prev
          </button>
          <div className="px-4 py-2">{page} / {totalPages}</div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-white border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorListing;