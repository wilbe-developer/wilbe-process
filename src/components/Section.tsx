
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  withContainer?: boolean;
}

const Section: React.FC<SectionProps> = ({ 
  id, 
  className, 
  children, 
  withContainer = true
}) => {
  return (
    <section
      id={id}
      className={cn('py-16 md:py-24', className)}
    >
      {withContainer ? (
        <div className="container max-w-3xl px-6 mx-auto">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
};

export default Section;
