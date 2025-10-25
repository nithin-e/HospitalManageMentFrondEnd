
import { useState, useEffect } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Switch } from "@/components/admin/ui/switch";
import UserAvatar from "../ui/UserAvatar";
import { Search, Loader2, Filter, UserCheck, UserX, RefreshCw, ChevronDown, ChevronUp, Calendar, Mail } from "lucide-react";
import { toast } from "@/components/admin/ui/use-toast";
import { cn } from "@/lib/utils";
import { paginationApi } from "@/store/AdminSideApi/paginationApi";
import { useSocket } from "@/context/socketContext";

// Custom debounce hook
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

const searchUsers = async (searchParams) => {
  try {

     console.log('whts happening here',searchParams)
    
    const params = new URLSearchParams();
    
    if (searchParams.search) {
      params.append('q', searchParams.search);
    }
    if (searchParams.status && searchParams.status !== 'all') {
      params.append('status', searchParams.status);
    }
    if (searchParams.sortBy) {
      params.append('sortBy', searchParams.sortBy);
    }
    if (searchParams.sortDirection) {
      params.append('sortDirection', searchParams.sortDirection);
    }
    if (searchParams.role) {
      params.append('role', searchParams.role);
    }
    if (searchParams.page) {
      params.append('page', searchParams.page);
    }
    if (searchParams.limit) {
      params.append('limit', searchParams.limit);
    }
     console.log('please check befoe the api call',params);

    const response = await paginationApi(params);

   
    
    if (!response.data.success) {
      throw new Error(`Search failed: ${response.data.message || 'Unknown error'}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Search API error:', error);
    throw error;
  }
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingUserId, setProcessingUserId] = useState(null);
  const [view, setView] = useState("grid"); 
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState("desc");
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [blockedUsers, setBlockedUsers] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const { socket, connected } = useSocket();
  const [usersPerPage] = useState(5); // Changed to 5 users per page as requested
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchUserData(true, currentPage);
  }, [statusFilter, sortDirection]);

  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setSearchLoading(true);
    } else {
      if (debouncedSearchTerm.trim()) {
        setIsSearchMode(true);
        handleSearch(currentPage);
      } else {
        setIsSearchMode(false);
        fetchUserData(true, currentPage);
      }
      setSearchLoading(false);
    }
  }, [debouncedSearchTerm, currentPage]);

  const fetchUserData = async (showLoadingSpinner = false, page=1) => {
    try {
      if (showLoadingSpinner) {
        setLoading(true);
      }
      
      setError(null);

      const searchParams = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        sortBy: "createdAt",
        sortDirection: sortDirection,
        role: "user",
        page: page,
        limit: usersPerPage
      };

      const cleanParams = Object.fromEntries(
        Object.entries(searchParams).filter(([_, value]) => value !== undefined)
      );

      console.log("Fetching users with params:", cleanParams);
      
      const response = await searchUsers(cleanParams);
      console.log("API user data response:", response);

      setUsers(response.users || []);
      setTotalUsers(response.totalCount || 0);
      setActiveUsers(response.activeCount || 0);
      setBlockedUsers(response.blockedCount || 0);
      setCurrentPage(page);
      setTotalPages(response.totalPages ? response.totalPages : Math.ceil(response.totalCount / usersPerPage) || 1);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
      setUsers([]);
      setTotalUsers(0);
      setActiveUsers(0);
      setBlockedUsers(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSearch = async (page = 1) => {
    try {
      setSearchLoading(true);
      setError(null);

      const searchParams = {
        search: debouncedSearchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sortBy: "createdAt",
        sortDirection: sortDirection,
        role: "user",
        page: page,
        limit: usersPerPage
      };

      const cleanParams = Object.fromEntries(
        Object.entries(searchParams).filter(([_, value]) => value !== undefined)
      );

      console.log("Searching users with params:", cleanParams);
      
      const response = await searchUsers(cleanParams);
      console.log("Search API response:", response);

      setUsers(response.users || []);
      setTotalUsers(response.totalCount || 0);
      setActiveUsers(response.activeCount || 0);
      setBlockedUsers(response.blockedCount || 0);
      setCurrentPage(page);
      setTotalPages(response.totalPages ? response.totalPages : Math.ceil(response.totalCount / usersPerPage) || 1);
    } catch (error) {
      console.error("Error searching users:", error);
      setError(`Failed to search users: ${error.message}`);
      setUsers([]);
      setTotalUsers(0);
      setActiveUsers(0);
      setBlockedUsers(0);
      setTotalPages(1);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleToggleBlock = (id, isActive) => {
    if (!socket || !connected) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Socket is not connected. Please try again later.",
      });
      return;
    }

    setProcessingUserId(id);

    const event = isActive ? "block_user" : "unblock_user";
    socket.emit(event, { userId: id }, (response) => {
      console.log("Socket response:", response);
      
      setProcessingUserId(null);

      if (response && response.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === id ? { ...user, isActive: !isActive } : user
          )
        );
        
        if (isActive) {
          setActiveUsers(prev => prev - 1);
          setBlockedUsers(prev => prev + 1);
        } else {
          setActiveUsers(prev => prev + 1);
          setBlockedUsers(prev => prev - 1);
        }
        
        toast({
          title: isActive ? "User Blocked" : "User Unblocked",
          description: `User has been ${isActive ? "blocked" : "unblocked"} successfully.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response?.error || `Failed to ${isActive ? "block" : "unblock"} user.`,
        });
      }
    });
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearchMode(false);
    setSearchLoading(false);
    setCurrentPage(1); // Reset to first page
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setIsSearchMode(false);
    setSearchLoading(false);
    setCurrentPage(1); // Reset to first page
  };

  const handleRefresh = () => {
    if (isSearchMode && debouncedSearchTerm.trim()) {
      handleSearch(currentPage);
    } else {
      fetchUserData(true, currentPage);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      if (isSearchMode) {
        handleSearch(page);
      } else {

        console.log('check this ..................',page);
        
        fetchUserData(true, page);
      }
    }
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
      <div className="flex justify-center items-center gap-2 mt-4">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading || searchLoading}
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
        >
          Previous
        </Button>
        {pageNumbers.map((page) => (
          <Button
            key={page}
            onClick={() => handlePageChange(page)}
            className={cn(
              "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100",
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
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
            <p className="text-slate-500 mt-1">Monitor and manage all platform users</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh}
              disabled={loading || searchLoading}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-2"
            >
              <RefreshCw size={18} className={(loading || searchLoading) ? "animate-spin" : ""} />
              <span className="hidden md:inline">Refresh</span>
            </Button>
            
            <Button
              onClick={() => setView(view === "grid" ? "list" : "grid")} 
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              {view === "grid" ? "List View" : "Grid View"}
            </Button>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-1 text-slate-800">{totalUsers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold mt-1 text-slate-800">{activeUsers}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Blocked Users</p>
                <p className="text-3xl font-bold mt-1 text-slate-800">{blockedUsers}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search users by name..."
              className="pl-10 pr-10 h-12 border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 rounded-lg shadow-sm w-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              </div>
            )}
            
            {searchTerm && !searchLoading && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 h-12 px-4 rounded-lg shadow-sm flex items-center gap-2"
            >
              <Filter size={18} />
              <span>Filters</span>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
            
            <Button 
              onClick={toggleSortDirection}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 h-12 px-4 rounded-lg shadow-sm flex items-center gap-2"
            >
              {sortDirection === "desc" ? "Newest First" : "Oldest First"}
              {sortDirection === "desc" ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </Button>
          </div>
        </div>

        {(searchTerm || debouncedSearchTerm) && (
          <div className="mb-4 text-sm text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200">
            {searchLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching backend for "{searchTerm}"...
              </span>
            ) : (
              <span>
                {users.length > 0 
                  ? `Search API returned ${users.length} user(s) matching "${debouncedSearchTerm}"`
                  : `No users found in search API for "${debouncedSearchTerm}"`
                }
              </span>
            )}
          </div>
        )}
        
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-slate-100">
            <div className="font-medium mb-2 text-slate-700">Filter by Status</div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleStatusFilterChange("all")}
                className={cn(
                  "rounded-full px-4 py-1 text-sm font-medium",
                  statusFilter === "all" 
                    ? "bg-blue-100 text-blue-700 border border-blue-300" 
                    : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                )}
              >
                All Users
              </Button>
              <Button
                onClick={() => handleStatusFilterChange("active")}
                className={cn(
                  "rounded-full px-4 py-1 text-sm font-medium",
                  statusFilter === "active" 
                    ? "bg-green-100 text-green-700 border border-green-300" 
                    : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                )}
              >
                Active Only
              </Button>
              <Button
                onClick={() => handleStatusFilterChange("blocked")}
                className={cn(
                  "rounded-full px-4 py-1 text-sm font-medium",
                  statusFilter === "blocked" 
                    ? "bg-red-100 text-red-700 border border-red-300" 
                    : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                )}
              >
                Blocked Only
              </Button>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl shadow-sm border border-slate-100">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-slate-600">
              {isSearchMode ? "Searching users..." : "Loading user data from backend..."}
            </p>
          </div>
        )}
        
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
        
        {!loading && !error && users.length === 0 && (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No users found</h3>
            <p className="text-slate-500 mb-4">
              {searchTerm 
                ? `No results from ${isSearchMode ? 'search API' : 'backend'} for "${debouncedSearchTerm}"` 
                : "Try adjusting your search or filters"
              }
            </p>
            <Button
              onClick={clearAllFilters}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Clear Filters
            </Button>
          </div>
        )}
        
        {!loading && !error && users.length > 0 && view === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="border-b border-slate-100 p-6 bg-gradient-to-r from-blue-50 to-slate-50">
                  <div className="flex justify-between mb-4">
                    <UserAvatar
                      src={user.profilePicture}
                      name={user.name}
                      className="h-16 w-16 ring-4 ring-white shadow-sm"
                    />
                    <div>
                      <span className={cn(
                        "inline-block px-3 py-1 rounded-full text-xs font-medium",
                        user.isActive 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      )}>
                        {user.isActive ? "Active" : "Blocked"}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-medium text-xl text-slate-800">{user.name}</h3>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center text-slate-600">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {user.isActive ? "Block this user?" : "Unblock this user?"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleBlock(user.id, user.isActive)}
                        className={cn(
                          "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500",
                          "transition-colors duration-200"
                        )}
                        disabled={processingUserId === user.id}
                      />
                      {processingUserId === user.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && !error && users.length > 0 && view === "list" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-8">
            <div className="grid grid-cols-12 p-4 bg-slate-50 font-medium text-slate-600 border-b border-slate-200 text-sm">
              <div className="col-span-5">User</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>
            
            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-12 p-4 items-center border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="col-span-5 flex items-center space-x-3">
                  <UserAvatar
                    src={user.profilePicture}
                    name={user.name}
                    className="h-10 w-10 ring-2 ring-slate-100"
                  />
                  <div>
                    <p className="font-medium text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">
                      Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                </div>
                
                <div className="col-span-3 text-sm text-slate-600 truncate">
                  {user.email}
                </div>
                
                <div className="col-span-2 flex justify-center">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    user.isActive 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  )}>
                    {user.isActive ? "Active" : "Blocked"}
                  </span>
                </div>
                
                <div className="col-span-2 flex items-center justify-center space-x-2">
                  <Switch
                    checked={user.isActive}
                    onCheckedChange={() => handleToggleBlock(user.id, user.isActive)}
                    className={cn(
                      "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500",
                      "transition-colors duration-200"
                    )}
                    disabled={processingUserId === user.id}
                  />
                  <span className="text-xs text-slate-600">
                    {processingUserId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      user.isActive ? "Block" : "Unblock"
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && users.length > 0 && renderPagination()}
      </div>
    </div>
  );
};

export default UserList;