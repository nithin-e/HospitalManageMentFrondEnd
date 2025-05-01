import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
import { Button } from '@/components/user/ui/button';
// import { Input } from '@/components/ui/input';
import { Input } from '@/components/user/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail, BellRing, CheckCircle } from 'lucide-react';

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Here you would typically send this to your API
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      
      // Reset form
      setEmail('');
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="bg-gradient-to-r from-dna-primary to-dna-dark py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="pattern-circles" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
            <circle id="pattern-circle" cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2"></circle>
          </pattern>
          <rect id="rect" x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
        </svg>
      </div>
      
      <div className="container mx-auto max-w-xl text-center relative z-10">
        <div className="inline-flex justify-center items-center w-16 h-16 bg-white/20 rounded-full mb-6 shadow-md">
          <Mail size={28} className="text-white" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Stay Updated with Medical Insights</h3>
        <p className="text-gray-200 mb-8 text-lg">
          Join our newsletter for the latest health tips, medical news, and exclusive promotions
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
          <div className="flex-grow relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
              <Mail size={18} />
            </div>
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 bg-white/10 text-white border-0 pl-10 focus-visible:ring-dna-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dna-dark placeholder-white/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <Button 
            type="submit" 
            className="h-12 px-8 bg-white hover:bg-dna-accent text-dna-primary transition-colors font-semibold shadow-lg hover:shadow-xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Subscribing...
              </>
            ) : (
              <>
                <BellRing size={18} className="mr-2" />
                Subscribe
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NewsletterForm;