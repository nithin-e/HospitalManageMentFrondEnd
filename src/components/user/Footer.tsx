
import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const isMobile = useIsMobile();
  
  return (
    <footer className="bg-brand-blue text-white relative overflow-hidden">
      <motion.div 
        className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
      />
    
      <div className="container mx-auto max-w-7xl">
        <div className="py-10 sm:py-12 md:py-16 px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.h3 
                className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 relative inline-block"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                HealNova
                <motion.div 
                  className="h-1 w-0 bg-brand-accent absolute -bottom-1 left-0"
                  initial={{ width: 0 }}
                  whileInView={{ width: 36 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                />
              </motion.h3>
              
              <p className="text-white/80 mb-4 sm:mb-6 text-xs sm:text-sm">
                Providing quality healthcare services with compassion and excellence since 2005.
              </p>
              
              <div className="flex space-x-3 sm:space-x-4">
                {['twitter', 'facebook', 'instagram'].map((platform, index) => (
                  <motion.a 
                    key={platform}
                    href="#" 
                    className="text-white/60 hover:text-white transition-colors bg-white/10 p-1.5 sm:p-2 rounded-full"
                    whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.2)' }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 + (index * 0.1) }}
                  >
                    {platform === 'twitter' && (
                      <svg width={isMobile ? "16" : "20"} height={isMobile ? "16" : "20"} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                      </svg>
                    )}
                    {platform === 'facebook' && (
                      <svg width={isMobile ? "16" : "20"} height={isMobile ? "16" : "20"} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                      </svg>
                    )}
                    {platform === 'instagram' && (
                      <svg width={isMobile ? "16" : "20"} height={isMobile ? "16" : "20"} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                      </svg>
                    )}
                  </motion.a>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 relative inline-block">
                Quick Links
                <motion.div 
                  className="h-0.5 w-0 bg-brand-accent absolute -bottom-1 left-0"
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              </h3>
              
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                {['Home', 'About Us', 'Services', 'Our Doctors'].map((link, index) => (
                  <motion.li 
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
                  >
                    <motion.a 
                      href={`#${link.toLowerCase().replace(' ', '-')}`} 
                      className="text-white/80 hover:text-white transition-colors flex items-center"
                      whileHover={{ x: 3 }}
                    >
                      <motion.span 
                        className="mr-1 sm:mr-2 text-xs opacity-60"
                        animate={{ x: [0, 2, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}  
                      >
                        →
                      </motion.span>
                      {link}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 relative inline-block">
                Important Links
                <motion.div 
                  className="h-0.5 w-0 bg-brand-accent absolute -bottom-1 left-0"
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              </h3>
              
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Site Map'].map((link, index) => (
                  <motion.li 
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
                  >
                    <motion.a 
                      href="#" 
                      className="text-white/80 hover:text-white transition-colors flex items-center"
                      whileHover={{ x: 3 }}
                    >
                      <motion.span 
                        className="mr-1 sm:mr-2 text-xs opacity-60"
                        animate={{ x: [0, 2, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}  
                      >
                        →
                      </motion.span>
                      {link}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 relative inline-block">
                Contact Us
                <motion.div 
                  className="h-0.5 w-0 bg-brand-accent absolute -bottom-1 left-0"
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              </h3>
              
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                {[
                  { icon: 'location', text: '123 Healthcare St, Medical City, MC 12345' },
                  { icon: 'phone', text: '+1 (555) 123-4567' },
                  { icon: 'email', text: 'info@healnovahealthcare.com' }
                ].map((item, index) => (
                  <motion.li 
                    key={item.icon}
                    className="flex items-start"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                  >
                    {item.icon === 'location' && (
                      <svg className="mr-1 sm:mr-2 mt-1 w-3 h-3 sm:w-4 sm:h-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    )}
                    {item.icon === 'phone' && (
                      <svg className="mr-1 sm:mr-2 mt-1 w-3 h-3 sm:w-4 sm:h-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    )}
                    {item.icon === 'email' && (
                      <svg className="mr-1 sm:mr-2 mt-1 w-3 h-3 sm:w-4 sm:h-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    )}
                    <span className="text-white/80">{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          className="mt-6 sm:mt-8 py-4 sm:py-6 border-t border-white/10 text-center text-xs sm:text-sm text-white/60 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p>&copy; {currentYear} HealNova Healthcare. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
