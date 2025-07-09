import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GifSettings } from "@shared/schema";

interface GifControlsProps {
  settings: GifSettings;
  onSettingsChange: (settings: GifSettings) => void;
  images: File[];
  onGenerationStart: (isGenerating: boolean) => void;
  onJobIdSet: (jobId: number) => void;
}

export default function GifControls({ 
  settings, 
  onSettingsChange, 
  images, 
  onGenerationStart,
  onJobIdSet 
}: GifControlsProps) {
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      console.log('Uploading files:', files);
      const formData = new FormData();
      files.forEach(file => {
        console.log('Adding file:', file.name, file.type, file.size);
        formData.append('images', file);
      });
      
      console.log('FormData created, making request...');
      const response = await apiRequest('POST', '/api/upload', formData);
      console.log('Upload response:', response);
      return response.json();
    },
    onSuccess: (data) => {
      generateGif(data.images.map((img: any) => img.filename));
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Failed to upload images. Please try again.",
      });
      onGenerationStart(false);
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { images: string[], settings: GifSettings }) => {
      const response = await apiRequest('POST', '/api/generate-gif', data);
      return response.json();
    },
    onSuccess: (data) => {
      onJobIdSet(data.jobId);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Generation Error",
        description: "Failed to generate GIF. Please try again.",
      });
      onGenerationStart(false);
    }
  });

  const generateGif = (imageFilenames: string[]) => {
    generateMutation.mutate({
      images: imageFilenames,
      settings
    });
  };

  const handleGenerate = () => {
    if (images.length === 0) {
      toast({
        variant: "destructive",
        title: "No Images",
        description: "Please upload at least one image to generate a GIF.",
      });
      return;
    }

    onGenerationStart(true);
    uploadMutation.mutate(images);
  };

  const updateSettings = (key: keyof GifSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Animation Settings</h2>
        
        <div className="space-y-4">
          {/* Speed Control */}
          <div>
            <Label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
              <span>Animation Speed</span>
              <span className="text-slate-500">{settings.speed}ms</span>
            </Label>
            <Slider
              value={[settings.speed]}
              onValueChange={(value) => updateSettings('speed', value[0])}
              min={100}
              max={2000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Fast</span>
              <span>Slow</span>
            </div>
          </div>

          {/* Loop Control */}
          <div>
            <Label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
              <span>Loop Count</span>
              <span className="text-slate-500">
                {settings.loop === 0 ? 'Infinite' : `${settings.loop} times`}
              </span>
            </Label>
            <Select value={settings.loop.toString()} onValueChange={(value) => updateSettings('loop', parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Infinite</SelectItem>
                <SelectItem value="1">1 time</SelectItem>
                <SelectItem value="3">3 times</SelectItem>
                <SelectItem value="5">5 times</SelectItem>
                <SelectItem value="10">10 times</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality Control */}
          <div>
            <Label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
              <span>Quality</span>
              <span className="text-slate-500 capitalize">{settings.quality}</span>
            </Label>
            <Select value={settings.quality} onValueChange={(value) => updateSettings('quality', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (Better quality)</SelectItem>
                <SelectItem value="medium">Medium (Balanced)</SelectItem>
                <SelectItem value="low">Low (Smaller file)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dimensions */}
          <div>
            <Label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
              <span>Dimensions</span>
              <span className="text-slate-500">
                {settings.width && settings.height ? `${settings.width}x${settings.height}` : 'Auto'}
              </span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Width"
                value={settings.width || ''}
                onChange={(e) => updateSettings('width', e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <Input
                type="number"
                placeholder="Height"
                value={settings.height || ''}
                onChange={(e) => updateSettings('height', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Leave empty for auto-resize</p>
          </div>
        </div>

        <Button 
          onClick={handleGenerate}
          disabled={images.length === 0 || uploadMutation.isPending || generateMutation.isPending}
          className="w-full mt-6 bg-primary hover:bg-blue-700"
        >
          <Wand2 className="mr-2" size={16} />
          Generate GIF
        </Button>
      </CardContent>
    </Card>
  );
}
