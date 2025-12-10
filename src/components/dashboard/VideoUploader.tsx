import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileVideo, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface VideoUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
}

export const VideoUploader = ({ onUpload, isUploading, uploadProgress }: VideoUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onUpload(file);
    }
  }, [onUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onUpload(file);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-strong border-border/50 overflow-hidden">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Upload Video for Analysis</CardTitle>
          <CardDescription>
            Drag and drop or browse to detect deepfakes with our advanced AI
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!selectedFile ? (
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-primary bg-primary/5 scale-[1.02]' 
                  : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              
              <motion.div
                animate={dragActive ? { scale: 1.1, y: -10 } : { scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none"
              >
                <motion.div 
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FileVideo className="w-10 h-10 text-primary" />
                </motion.div>
                
                <h3 className="text-lg font-semibold mb-2">
                  {dragActive ? 'Drop your video here' : 'Drag and drop your video here'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  or click anywhere to browse
                </p>
                
                <Button variant="outline" className="pointer-events-none">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Video File
                </Button>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileVideo className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                {!isUploading && (
                  <Button variant="ghost" size="icon" onClick={clearSelection}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="font-medium">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              
              {uploadProgress === 100 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-success"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Upload complete, analyzing...</span>
                </motion.div>
              )}
            </div>
          )}
          
          <p className="mt-6 text-xs text-muted-foreground text-center">
            Supported: MP4, AVI, MOV, WebM • Max size: 50MB
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
