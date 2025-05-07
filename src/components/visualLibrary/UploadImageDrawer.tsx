
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadImageDrawer = () => {
  const navigate = useNavigate();

  const handleRedirectToUpload = () => {
    navigate('/upload-image');
  };

  return (
    <div>
      <Button 
        className="group bg-blue-500 hover:bg-blue-600 w-full"
        onClick={handleRedirectToUpload}
      >
        <Upload className="mr-2 h-4 w-4" />
        رفع صورة تعليمية
      </Button>
    </div>
  );
};

export default UploadImageDrawer;
