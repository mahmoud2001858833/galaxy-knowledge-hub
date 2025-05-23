
import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import ChemistryGrades from './chemistry/ChemistryGrades';

const ChemistryVideos = () => {
  const { t, dir } = useLanguage();

  return (
    <div className="space-y-6" dir={dir}>
      <ChemistryGrades />
    </div>
  );
};

export default ChemistryVideos;
