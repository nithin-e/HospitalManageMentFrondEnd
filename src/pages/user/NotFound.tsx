import { useState, useEffect } from "react";
import { Home, Stethoscope, Plus, Activity } from "lucide-react";

const NotFound = () => {
  const [pathname] = useState("/appointment/schedule");

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname
    );
  }, [pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Medical Crosses */}
        <div className="absolute top-20 left-10 animate-float opacity-5" style={{ animationDelay: '0s' }}>
          <Plus className="w-16 h-16" style={{ color: 'rgb(0, 59, 115)' }} strokeWidth={3} />
        </div>
        <div className="absolute top-40 right-20 animate-float opacity-5" style={{ animationDelay: '2s' }}>
          <Plus className="w-12 h-12" style={{ color: 'rgb(0, 59, 115)' }} strokeWidth={3} />
        </div>
        <div className="absolute bottom-32 left-1/4 animate-float opacity-5" style={{ animationDelay: '1s' }}>
          <Plus className="w-20 h-20" style={{ color: 'rgb(0, 59, 115)' }} strokeWidth={3} />
        </div>
        <div className="absolute bottom-20 right-1/3 animate-float opacity-5" style={{ animationDelay: '3s' }}>
          <Plus className="w-14 h-14" style={{ color: 'rgb(0, 59, 115)' }} strokeWidth={3} />
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-1/3 right-10 w-64 h-64 rounded-full opacity-5 animate-pulse" style={{ background: 'rgb(0, 59, 115)' }}></div>
        <div className="absolute bottom-1/4 left-10 w-48 h-48 rounded-full opacity-5 animate-pulse" style={{ background: 'rgb(0, 59, 115)', animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="text-center max-w-2xl relative z-10">
        {/* Stethoscope Icon */}
        <div className="mb-8 flex justify-center animate-slideDown">
          <div className="relative">
            <div className="w-32 h-32 rounded-full flex items-center justify-center border-4 shadow-2xl" 
                 style={{ 
                   backgroundColor: 'rgba(0, 59, 115, 0.05)',
                   borderColor: 'rgb(0, 59, 115)'
                 }}>
              <Stethoscope className="w-16 h-16" style={{ color: 'rgb(0, 59, 115)' }} strokeWidth={2} />
            </div>
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full opacity-10 blur-xl animate-pulse" style={{ background: 'rgb(0, 59, 115)' }}></div>
          </div>
        </div>

        {/* 404 Error Code */}
        <div className="mb-8 animate-slideUp">
          <h1 className="text-9xl md:text-[12rem] font-black mb-2 tracking-tight" 
              style={{ color: 'rgb(0, 59, 115)' }}>
            404
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-1 w-16 rounded-full animate-pulse" style={{ backgroundColor: 'rgb(0, 59, 115)' }}></div>
            <Activity className="w-6 h-6 animate-pulse" style={{ color: 'rgb(0, 59, 115)' }} />
            <div className="h-1 w-16 rounded-full animate-pulse" style={{ backgroundColor: 'rgb(0, 59, 115)' }}></div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-10 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'rgb(0, 59, 115)' }}>
            Medical Record Not Found
          </h2>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-lg mx-auto">
            The page you're looking for has been discharged from our system.
          </p>
        </div>

        {/* Take Me Home Button */}
        <div className="animate-slideUp" style={{ animationDelay: '0.4s' }}>
          <a
            href="/"
            className="group relative inline-flex items-center gap-3 text-white font-bold px-12 py-5 rounded-full transition-all duration-300 shadow-2xl transform hover:scale-110 hover:-translate-y-1 overflow-hidden"
            style={{ 
              backgroundColor: 'rgb(0, 59, 115)',
              boxShadow: '0 20px 60px rgba(0, 59, 115, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 59, 115, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 59, 115, 0.3)';
            }}
          >
            {/* Button Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-shine"></div>
            
            <Home className="w-6 h-6 group-hover:rotate-[-10deg] transition-transform duration-300" />
            <span className="text-xl">Take Me Home</span>
          </a>
        </div>

        {/* Footer Text */}
        <p className="text-gray-400 text-sm mt-10 animate-slideUp" style={{ animationDelay: '0.6s' }}>
          Error Code: 404 • Status: Page Not Available
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(10deg);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slideDown {
          animation: slideDown 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-shine {
          animation: shine 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotFound;