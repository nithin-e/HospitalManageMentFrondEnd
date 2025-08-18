import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Star } from 'lucide-react';
import {Card, CardContent} from '@/components/ui/docui/card'
import { Badge } from '@/components/ui/docui/badge';

interface ServiceCardProps {
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  featured?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  title, 
  description, 
  icon, 
  imageUrl,
  featured = false
}) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-8px] border-gray-100 h-full group">
      {imageUrl && (
        <div className="h-52 overflow-hidden relative">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transform transition-transform group-hover:scale-110 duration-700 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dna-primary/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {featured && (
            <Badge className="absolute top-3 right-3 bg-dna-secondary/90 hover:bg-dna-secondary text-white font-medium">
              <Star size={12} className="mr-1" /> Featured
            </Badge>
          )}
        </div>
      )}
      <CardContent className="p-6 bg-white relative">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-dna-primary transition-colors">{title}</h3>
          <span className="text-dna-secondary">
            <BadgeCheck size={20} />
          </span>
        </div>
        <p className="text-gray-600 mb-5">{description}</p>
        <Link 
          to="#" 
          className="text-dna-secondary hover:text-dna-primary inline-flex items-center font-medium transition-colors group-hover:font-semibold relative pl-0 hover:pl-2 transition-all duration-300" 
          aria-label={`Learn more about ${title}`}
        >
          <span className="absolute w-0 h-0.5 bg-dna-secondary bottom-0 left-0 group-hover:w-full transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
          Learn more 
          <ArrowRight size={16} className="ml-1 group-hover:translate-x-2 transition-transform duration-300" />
        </Link>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
