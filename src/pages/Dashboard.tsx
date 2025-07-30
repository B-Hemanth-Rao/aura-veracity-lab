import { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, FileVideo, Loader2, LogOut, History, RotateCcw } from 'lucide-react';

interface DetectionJob {
  id: string;
  original_filename: string;
  status: string;
  upload_timestamp: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [currentJob, setCurrentJob] = useState<DetectionJob | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const pollJobStatus = useCallback(async (jobId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    const poll = async () => {
      try {
        const { data: job, error } = await supabase
          .from('detection_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) throw error;

        setCurrentJob(job);

        if (job.status === 'completed') {
          toast({
            title: "Analysis Complete!",
            description: "Your video has been analyzed successfully.",
          });
          // Redirect to results page
          window.location.href = `/results/${jobId}`;
          return;
        } else if (job.status === 'failed') {
          toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "There was an error processing your video.",
          });
          setCurrentJob(null);
          return;
        }

        attempts++;
        if (attempts < maxAttempts && (job.status === 'pending' || job.status === 'processing')) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else if (attempts >= maxAttempts) {
          toast({
            variant: "destructive",
            title: "Timeout",
            description: "Analysis is taking longer than expected. Please try again.",
          });
          setCurrentJob(null);
        }
      } catch (error: any) {
        console.error('Polling error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to check analysis status.",
        });
        setCurrentJob(null);
      }
    };

    poll();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a video file.",
      });
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a video smaller than 50MB.",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create detection job
      const { data: job, error: jobError } = await supabase
        .from('detection_jobs')
        .insert({
          user_id: user.id,
          original_filename: file.name,
          file_path: fileName,
          status: 'pending'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      setCurrentJob(job);
      setUploadProgress(100);

      // Start AI processing
      await supabase.functions.invoke('ai-detection', {
        body: { jobId: job.id }
      });

      // Start polling for results
      pollJobStatus(job.id);

      toast({
        title: "Upload successful!",
        description: "Your video is now being analyzed.",
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload video.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const resetUpload = () => {
    setCurrentJob(null);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Aura Veracity
            </h1>
            <span className="text-sm text-muted-foreground">Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {!currentJob ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Upload Video for Analysis</CardTitle>
                  <CardDescription>
                    Upload a video file to detect potential deepfakes using our advanced AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                      dragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <motion.div
                      animate={dragActive ? { scale: 1.05 } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FileVideo className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">
                        Drag and drop your video here
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        or click to browse files
                      </p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <Button disabled={uploading}>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Video File
                      </Button>
                    </motion.div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground text-center">
                    Supported formats: MP4, AVI, MOV, WebM • Max size: 50MB
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">
                    {currentJob.status === 'pending' && "Preparing Analysis..."}
                    {currentJob.status === 'processing' && "AI Analysis in Progress"}
                    {currentJob.status === 'completed' && "Analysis Complete!"}
                    {currentJob.status === 'failed' && "Analysis Failed"}
                  </CardTitle>
                  <CardDescription>
                    File: {currentJob.original_filename}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  {currentJob.status === 'processing' && (
                    <div className="text-center">
                      <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-8 h-8 text-primary" />
                      </motion.div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Our AI is analyzing your video for deepfake indicators...
                        </p>
                        <div className="text-xs text-muted-foreground">
                          <p>🔍 Scanning facial regions and temporal consistency</p>
                          <p>🎵 Analyzing audio-visual synchronization</p>
                          <p>🧠 Processing with neural networks</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button variant="outline" onClick={resetUpload}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Upload Another Video
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;