import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<Props> = ({ icon: Icon, title, description }) => (
  <div className="p-6 rounded-2xl bg-[hsl(var(--damij-surface))]/70 border border-[hsl(var(--damij-primary))]/10">
    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--damij-accent))]/15 text-[hsl(var(--damij-accent-2))] flex items-center justify-center mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="text-lg font-bold text-[hsl(var(--damij-primary))] mb-2">{title}</h4>
    <p className="text-sm text-[hsl(var(--damij-text))]/70 leading-relaxed">{description}</p>
  </div>
);

export default FeatureCard;
