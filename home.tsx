import { useState } from "react";
import { Film, HelpCircle, Settings } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import ImagePreviewGrid from "@/components/ImagePreviewGrid";
import GifControls from "@/components/GifControls";
import GifPreview from "@/components/GifPreview";
import ProgressModal from "@/components/ProgressModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { GifSettings } from "@shared/schema";

export default function Home() {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [gifSettings, setGifSettings] = useState<GifSettings>({
    speed: 150,
    loop: 0,
    quality: "high",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGif, setGeneratedGif] = useState<string | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleImagesUpload = (files: File[]) => {
    setUploadedImages(files);
    toast({
      title: "Success",
      description: `${files.length} image(s) uploaded successfully!`,
    });
  };

  const handleImageRemove = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageReorder = (fromIndex: number, toIndex: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  const handleClearAll = () => {
    setUploadedImages([]);
    setGeneratedGif(null);
    setJobId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Film className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">GIF Creator</h1>
                <p className="text-sm text-slate-500">Convert images to animated GIF</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-800">
                <HelpCircle size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-800">
                <Settings size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <ImageUploader 
              onImagesUpload={handleImagesUpload}
              uploadedImages={uploadedImages}
            />
            
            {uploadedImages.length > 0 && (
              <ImagePreviewGrid
                images={uploadedImages}
                onImageRemove={handleImageRemove}
                onImageReorder={handleImageReorder}
                onClearAll={handleClearAll}
              />
            )}
          </div>

          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <GifControls
              settings={gifSettings}
              onSettingsChange={setGifSettings}
              images={uploadedImages}
              onGenerationStart={setIsGenerating}
              onJobIdSet={setJobId}
            />
            
            {generatedGif && (
              <GifPreview
                gifUrl={generatedGif}
                jobId={jobId}
              />
            )}
          </div>
        </div>

        {/* Progress Modal */}
        <ProgressModal
          isOpen={isGenerating}
          onClose={() => setIsGenerating(false)}
          jobId={jobId}
          onGifReady={setGeneratedGif}
        />

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Features</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Multiple image upload</li>
                  <li>• Drag & drop interface</li>
                  <li>• Customizable animation speed</li>
                  <li>• High-quality GIF generation</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Supported Formats</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• JPEG/JPG images</li>
                  <li>• PNG images</li>
                  <li>• WEBP images</li>
                  <li>• Maximum 10MB per image</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Tips</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Use similar-sized images for best results</li>
                  <li>• Fewer images = smaller file size</li>
                  <li>• Adjust quality for optimal balance</li>
                  <li>• Preview before downloading</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-slate-200 mt-8 pt-8 text-center">
              <p className="text-sm text-slate-500">
                © 2024 GIF Creator. Built with modern web technologies.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
