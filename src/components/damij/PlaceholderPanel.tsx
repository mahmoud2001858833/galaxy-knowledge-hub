import React from 'react';
import { Construction } from 'lucide-react';

interface Props {
  title?: string;
  description?: string;
}

const PlaceholderPanel: React.FC<Props> = ({
  title = 'هذه الأداة قيد التطوير',
  description = 'البنية جاهزة لربط النموذج والمنطق لاحقاً.',
}) => (
  <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border-2 border-dashed border-[hsl(var(--damij-primary))]/30 bg-[hsl(var(--damij-surface))]/60 backdrop-blur-sm">
    <Construction className="w-12 h-12 text-[hsl(var(--damij-accent))] mb-4" />
    <h3 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-2">{title}</h3>
    <p className="text-lg text-[hsl(var(--damij-text))]/70 max-w-md">{description}</p>
  </div>
);

export default PlaceholderPanel;
