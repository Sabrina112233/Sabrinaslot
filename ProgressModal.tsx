import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number | null;
  onGifReady: (gifUrl: string) => void;
}

export default function ProgressModal({ isOpen, onClose, jobId, onGifReady }: ProgressModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Processing images");

  const { data: jobStatus, refetch } = useQuery({
    queryKey: ['/api/gif-job', jobId],
    enabled: isOpen && jobId !== null,
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (jobStatus) {
      if (jobStatus.status === 'completed') {
        setProgress(100);
        setCurrentStep("Finalizing GIF");
        
        setTimeout(() => {
          onGifReady(`/api/download/${jobStatus.filename}`);
          onClose();
        }, 1000);
      } else if (jobStatus.status === 'failed') {
        onClose();
      } else {
        // Simulate progress for processing status
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) return prev;
            return prev + 10;
          });
        }, 500);

        // Update step text based on progress
        if (progress <= 30) {
          setCurrentStep("Resizing images");
        } else if (progress <= 60) {
          setCurrentStep("Creating animation");
        } else if (progress <= 90) {
          setCurrentStep("Optimizing quality");
        } else {
          setCurrentStep("Finalizing GIF");
        }

        return () => clearInterval(interval);
      }
    }
  }, [jobStatus, progress, onClose, onGifReady]);

  // Reset progress when modal opens
  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setCurrentStep("Processing images");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">Creating Your GIF</DialogTitle>
        <DialogDescription className="sr-only">
          Please wait while we process your images and create your animated GIF
        </DialogDescription>
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Settings className="text-primary animate-spin" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Creating Your GIF</h3>
          <p className="text-slate-500 mb-4">Please wait while we process your images...</p>
          
          <Progress value={progress} className="mb-4" />
          
          <p className="text-sm text-slate-400">
            {currentStep} • {progress}%
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
