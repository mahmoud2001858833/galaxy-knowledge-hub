
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadJournalDrawer = () => {
  const navigate = useNavigate();

  const handleOpenFullPage = () => {
    navigate('/upload-journal');
  };

  return (
    <Button 
      onClick={handleOpenFullPage}
      className="group bg-purple-500 hover:bg-purple-600"
    >
      <Upload className="mr-2 h-4 w-4" />
      رفع مجلة علمية (حجم لا محدود)
    </Button>
  );
};

export default UploadJournalDrawer;
