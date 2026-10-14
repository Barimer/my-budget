import React from 'react';
import { 
  Utensils, 
  Coffee, 
  Car, 
  ShoppingBag, 
  Smartphone, 
  Film, 
  HeartPulse, 
  Sparkles,
  HelpCircle,
  Tag,
  DollarSign,
  Briefcase,
  Home,
  BookOpen,
  Gift
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-5 h-5', size }) => {
  const props = { className, size };

  switch (iconName) {
    case 'Utensils':
      return <Utensils {...props} />;
    case 'Coffee':
      return <Coffee {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    case 'Film':
      return <Film {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Home':
      return <Home {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'Gift':
      return <Gift {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'DollarSign':
      return <DollarSign {...props} />;
    case 'Tag':
      return <Tag {...props} />;
    default:
      return <HelpCircle {...props} />;
  }
};

export const AVAILABLE_ICONS = [
  'Utensils', 'Coffee', 'Car', 'ShoppingBag', 'Smartphone', 
  'Film', 'HeartPulse', 'Sparkles', 'Home', 'BookOpen', 'Gift', 'Briefcase', 'Tag'
];
