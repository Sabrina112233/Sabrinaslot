import { Download, PlayCircle, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GifPreviewProps {
  gifUrl: string | null;
  jobId: number | null;
}

export default function GifPreview({ gifUrl, jobId }: GifPreviewProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    if (gifUrl && jobId) {
      const filename = `gif-${jobId}.gif`;
      const link = document.createElement('a');
      link.href = `/api/download/${filename}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Your GIF is being downloaded.",
      });
    }
  };

  if (!gifUrl) return null;

  const previewUrl = jobId ? `/api/preview/gif-${jobId}.gif` : gifUrl;
  const downloadUrl = jobId ? `/api/download/gif-${jobId}.gif` : gifUrl;

  return (
    <Card className="mb-6 animate-fade-in">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Preview</h2>
        
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="w-full aspect-square bg-slate-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
            {gifUrl ? (
              <img
                src={previewUrl}
                alt="Generated GIF"
                className="max-w-full max-h-full object-contain"
                style={{ backgroundColor: 'transparent' }}
              />
            ) : (
              <div className="animate-pulse-soft">
                <PlayCircle className="text-slate-400" size={48} />
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleDownload}
              className="flex-1 bg-accent hover:bg-green-600"
              disabled={!gifUrl}
            >
              <Download className="mr-2" size={16} />
              Download GIF
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open(previewUrl, '_blank')}
              disabled={!gifUrl}
            >
              <Eye className="mr-2" size={16} />
              Open in New Tab
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
