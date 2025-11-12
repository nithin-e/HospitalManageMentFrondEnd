import { useState, useEffect } from "react";
import { Home, Stethoscope } from "lucide-react";

const NotFound = () => {
  const [pathname] = useState("/appointment/schedule");

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname
    );
  }, [pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* Main Content */}
      <div className="text-center max-w-2xl">
        {/* Stethoscope Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 shadow-lg" 
               style={{ 
                 backgroundColor: 'rgba(0, 59, 115, 0.05)',
                 borderColor: 'rgb(0, 59, 115)'
               }}>
            <Stethoscope className="w-12 h-12" style={{ color: 'rgb(0, 59, 115)' }} strokeWidth={2} />
          </div>
        </div>

        {/* 404 Error Code */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-black mb-4 tracking-tight" 
              style={{ color: 'rgb(0, 59, 115)' }}>
            404
          </h1>
        </div>

        {/* Message */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'rgb(0, 59, 115)' }}>
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Take Me Home Button */}
        <div>
          <a
            href="/"
            className="inline-flex items-center gap-3 text-white font-semibold px-10 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            style={{ 
              backgroundColor: 'rgb(0, 59, 115)'
            }}
          >
            <Home className="w-5 h-5" />
            <span className="text-lg">Take Me Home</span>
          </a>
        </div>

        {/* Footer Text */}
        <p className="text-gray-400 text-sm mt-10">
          Error Code: 404
        </p>
      </div>
    </div>
  );
};

export default NotFound;