import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImagesUpload: (files: File[]) => void;
  uploadedImages: File[];
}

export default function ImageUploader({ onImagesUpload, uploadedImages }: ImageUploaderProps) {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Some files were rejected. Please check file size and format.",
      });
    }

    if (acceptedFiles.length > 0) {
      const validFiles = acceptedFiles.filter(file => {
        return file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024;
      });

      if (validFiles.length > 0) {
        // Replace existing images with new ones for single upload option
        onImagesUpload(validFiles);
      }
    }
  }, [onImagesUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true // Allow multiple selection in single upload
  });

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Upload Photos</h2>
          <span className="text-sm text-slate-500">
            {uploadedImages.length} photo{uploadedImages.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-primary bg-blue-50'
              : 'border-slate-300 hover:border-primary hover:bg-slate-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
              <CloudUpload className="text-slate-400" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                {isDragActive ? 'Drop your photos here' : 'Select multiple photos at once'}
              </h3>
              <p className="text-slate-500 mb-4">Drag & drop or click to browse</p>
              <Button className="bg-primary hover:bg-blue-700">
                <FolderOpen className="mr-2" size={16} />
                Choose Photos
              </Button>
            </div>
            <p className="text-sm text-slate-400">
              Upload 1 to 50 photos • JPG, PNG, WEBP • Max 10MB each
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
