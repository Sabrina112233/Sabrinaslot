import { ArrowUp, ArrowDown, X, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ImagePreviewGridProps {
  images: File[];
  onImageRemove: (index: number) => void;
  onImageReorder: (fromIndex: number, toIndex: number) => void;
  onClearAll: () => void;
}

export default function ImagePreviewGrid({ 
  images, 
  onImageRemove, 
  onImageReorder, 
  onClearAll 
}: ImagePreviewGridProps) {
  
  const moveImageUp = (index: number) => {
    if (index > 0) {
      onImageReorder(index, index - 1);
    }
  };

  const moveImageDown = (index: number) => {
    if (index < images.length - 1) {
      onImageReorder(index, index + 1);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Image Preview</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:text-red-700"
            onClick={onClearAll}
          >
            <Trash2 className="mr-1" size={16} />
            Clear All
          </Button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group bg-slate-50 rounded-lg overflow-hidden aspect-square">
              <img
                src={URL.createObjectURL(image)}
                alt={`Uploaded image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Image Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8 bg-white rounded-full hover:bg-slate-100"
                    onClick={() => moveImageUp(index)}
                    disabled={index === 0}
                  >
                    <ArrowUp size={12} />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8 bg-white rounded-full hover:bg-slate-100"
                    onClick={() => moveImageDown(index)}
                    disabled={index === images.length - 1}
                  >
                    <ArrowDown size={12} />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="w-8 h-8 rounded-full"
                    onClick={() => onImageRemove(index)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              </div>
              
              {/* Image Number */}
              <div className="absolute top-2 left-2 w-6 h-6 bg-black bg-opacity-70 text-white text-xs rounded-full flex items-center justify-center">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
