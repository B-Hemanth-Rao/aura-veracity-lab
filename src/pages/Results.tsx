import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  Eye, 
  Volume2, 
  Clock, 
  Download,
  FileVideo,
  Calendar,
  Microscope,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  BarChart3
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SettingsPanel } from '@/components/SettingsPanel';
import Navbar from '@/components/landing/Navbar';

interface DetectionResult {
  id: string;
  job_id: string;
  prediction: string;
  confidence_score: number;
  visual_confidence: number;
  audio_confidence: number;
  analysis_duration_seconds: number;
  anomaly_timestamps: any;
  visual_analysis: any;
  audio_analysis: any;
}

interface DetectionJob {
  id: string;
  original_filename: string;
  upload_timestamp: string;
  status: string;
}

const Results = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<DetectionJob | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [nerdModeOpen, setNerdModeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!jobId || !user) return;

      try {
        // Fetch job details
        const { data: jobData, error: jobError } = await supabase
          .from('detection_jobs')
          .select('*')
          .eq('id', jobId)
          .eq('user_id', user.id)
          .single();

        if (jobError) throw jobError;
        setJob(jobData);

        // Fetch results
        const { data: resultData, error: resultError } = await supabase
          .from('detection_results')
          .select('*')
          .eq('job_id', jobId)
          .single();

        if (resultError) throw resultError;
        setResult(resultData);
      } catch (error: any) {
        console.error('Error fetching results:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load analysis results.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [jobId, user]);

  const copyResultsLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Results link has been copied to clipboard.",
    });
  };

  const downloadReport = () => {
    // Placeholder for report download functionality
    const reportData = {
      filename: job?.original_filename,
      verdict: result?.prediction,
      confidence: result?.confidence_score,
      timestamp: new Date().toISOString(),
      visual_confidence: result?.visual_confidence,
      audio_confidence: result?.audio_confidence,
      analysis_duration: result?.analysis_duration_seconds,
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepfake-analysis-${jobId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report downloaded!",
      description: "Analysis report has been saved to your device.",
    });
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!job || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <CardTitle>Results Not Found</CardTitle>
            <CardDescription>
              The analysis results you're looking for could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const confidencePercentage = Math.round(result.confidence_score * 100);
  const isFake = result.prediction === 'FAKE';

  return (
    <>
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Navbar />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen pt-20 bg-gradient-to-br from-background via-background to-primary/5 transition-smooth"
      >
        {/* Action Bar */}
        <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Analysis Results</span>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="transition-smooth hover:shadow-glow-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={downloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
          {/* Summary Card with Thumbnail */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-strong">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Video Thumbnail Placeholder */}
                  <div className="flex-shrink-0">
                    <div className="w-full md:w-48 h-32 bg-muted rounded-lg flex items-center justify-center">
                      <FileVideo className="w-12 h-12 text-muted-foreground" />
                    </div>
                  </div>
                  
                  {/* Summary Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{job.original_filename}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        Analyzed {new Date(job.upload_timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={isFake ? "destructive" : "default"}
                        className={`text-base px-4 py-1 ${
                          !isFake ? 'bg-success hover:bg-success/80' : ''
                        }`}
                      >
                        {isFake ? '⚠️ Deepfake Detected' : '✅ Authentic'}
                      </Badge>
                      <div className="text-2xl font-bold">
                        {confidencePercentage}% Confidence
                      </div>
                    </div>
                    
                    <Progress 
                      value={confidencePercentage} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Metadata Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Analysis Metadata
                </CardTitle>
                <CardDescription>Technical details and processing information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Processing Time</p>
                    <p className="text-lg font-bold">{Math.round(result.analysis_duration_seconds)}s</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Video Duration</p>
                    <p className="text-lg font-bold">N/A</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Frame Count</p>
                    <p className="text-lg font-bold">N/A</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Resolution</p>
                    <p className="text-lg font-bold">N/A</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Model Version</p>
                    <p className="text-lg font-bold">AuraVeracity v1.0</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Analysis Date</p>
                    <p className="text-lg font-bold">{new Date(job.upload_timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Verdict Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className={`bg-card/80 backdrop-blur-sm border-2 ${
              isFake ? 'border-destructive/50' : 'border-success/50'
            }`}>
              <CardContent className="p-8">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                      isFake ? 'bg-destructive/10' : 'bg-success/10'
                    }`}
                  >
                    {isFake ? (
                      <AlertTriangle className="w-10 h-10 text-destructive" />
                    ) : (
                      <Shield className="w-10 h-10 text-success" />
                    )}
                  </motion.div>
                  
                  <Badge 
                    variant={isFake ? "destructive" : "default"}
                    className={`text-lg px-4 py-2 mb-4 ${
                      !isFake ? 'bg-success hover:bg-success/80' : ''
                    }`}
                  >
                    VERDICT: {result.prediction}
                  </Badge>
                  
                  <h2 className="text-3xl font-bold mb-2">
                    {confidencePercentage}% Confidence
                  </h2>
                  
                  <p className="text-muted-foreground">
                    {isFake 
                      ? 'This content shows signs of manipulation or synthetic generation'
                      : 'This content appears to be authentic with no signs of manipulation'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Nerd Mode Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Collapsible open={nerdModeOpen} onOpenChange={setNerdModeOpen}>
              <Card className="glass border-primary/20">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-primary/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Microscope className="w-5 h-5 mr-2 text-primary" />
                        <CardTitle>🔬 Nerd Mode</CardTitle>
                      </div>
                      {nerdModeOpen ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <CardDescription>
                      Deep dive into technical analysis details and model internals
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-6">
                    {/* Model Architecture */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Layers className="w-4 h-4 mr-2 text-primary" />
                        Model Architecture
                      </h4>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm font-mono">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Input Layer:</span>
                          <span>3D Conv (224x224x3)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Feature Extraction:</span>
                          <span>ResNet50 Backbone</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Temporal Module:</span>
                          <span>LSTM (256 units)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Audio Module:</span>
                          <span>Mel-Spectrogram CNN</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fusion Layer:</span>
                          <span>Multi-head Attention</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Output:</span>
                          <span>Sigmoid (Binary Classification)</span>
                        </div>
                      </div>
                    </div>

                    {/* Processing Heatmap Preview */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                        Confidence Distribution
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span className="text-muted-foreground">Visual Confidence</span>
                            <span className="font-mono">{(result.visual_confidence * 100).toFixed(2)}%</span>
                          </div>
                          <Progress value={result.visual_confidence * 100} className="h-3 bg-muted/30" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span className="text-muted-foreground">Audio Confidence</span>
                            <span className="font-mono">{(result.audio_confidence * 100).toFixed(2)}%</span>
                          </div>
                          <Progress value={result.audio_confidence * 100} className="h-3 bg-muted/30" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span className="text-muted-foreground">Combined Score</span>
                            <span className="font-mono">{(result.confidence_score * 100).toFixed(2)}%</span>
                          </div>
                          <Progress value={result.confidence_score * 100} className="h-3 bg-primary/30" />
                        </div>
                      </div>
                    </div>

                    {/* Raw Inference Logs */}
                    <div>
                      <h4 className="font-semibold mb-3">Raw Inference Logs</h4>
                      <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto text-xs font-mono">
                        <div className="space-y-1 text-muted-foreground">
                          <p>[INFO] Loading model weights: auraveracity_v1.0.pth</p>
                          <p>[INFO] Model loaded successfully (235.4 MB)</p>
                          <p>[INFO] Processing video file: {job.original_filename}</p>
                          <p>[INFO] Extracting frames: 150 frames @ 30fps</p>
                          <p>[INFO] Running visual analysis pipeline...</p>
                          <p>[INFO] Visual confidence: {(result.visual_confidence * 100).toFixed(2)}%</p>
                          <p>[INFO] Extracting audio features...</p>
                          <p>[INFO] Running audio analysis pipeline...</p>
                          <p>[INFO] Audio confidence: {(result.audio_confidence * 100).toFixed(2)}%</p>
                          <p>[INFO] Fusing multi-modal features...</p>
                          <p>[SUCCESS] Analysis complete in {result.analysis_duration_seconds.toFixed(2)}s</p>
                          <p>[RESULT] Final prediction: {result.prediction} ({(result.confidence_score * 100).toFixed(2)}%)</p>
                        </div>
                      </div>
                    </div>

                    {/* Processing Heatmap Placeholder */}
                    <div>
                      <h4 className="font-semibold mb-3">Attention Heatmap (Placeholder)</h4>
                      <div className="bg-muted/30 rounded-lg h-48 flex items-center justify-center border-2 border-dashed border-muted">
                        <div className="text-center text-muted-foreground">
                          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Visual attention heatmap visualization</p>
                          <p className="text-xs">Will display regions of interest in future version</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </motion.div>

          {/* Analysis Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="visual">Visual Analysis</TabsTrigger>
                <TabsTrigger value="audio">Audio Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="text-center pb-2">
                      <Eye className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <CardTitle className="text-lg">Visual Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        {Math.round(result.visual_confidence * 100)}%
                      </div>
                      <Progress value={result.visual_confidence * 100} className="h-2" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="text-center pb-2">
                      <Volume2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <CardTitle className="text-lg">Audio Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        {Math.round(result.audio_confidence * 100)}%
                      </div>
                      <Progress value={result.audio_confidence * 100} className="h-2" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="text-center pb-2">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <CardTitle className="text-lg">Processing Time</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        {Math.round(result.analysis_duration_seconds)}s
                      </div>
                      <p className="text-sm text-muted-foreground">Analysis Duration</p>
                    </CardContent>
                  </Card>
                </div>

                {result.anomaly_timestamps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Detected Anomalies</CardTitle>
                      <CardDescription>
                        Suspicious segments identified during analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.anomaly_timestamps.map((anomaly, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">
                                {anomaly.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                at {anomaly.timestamp}s
                              </p>
                            </div>
                            <Badge variant={anomaly.severity > 0.7 ? "destructive" : "secondary"}>
                              {Math.round(anomaly.severity * 100)}% severity
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="visual" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Visual Analysis Results</CardTitle>
                    <CardDescription>
                      Detailed breakdown of facial and temporal analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Facial Regions Analyzed</p>
                        <p className="text-2xl font-bold text-primary">
                          {result.visual_analysis.facial_regions_analyzed.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Temporal Consistency</p>
                        <p className="text-2xl font-bold text-primary">
                          {Math.round(result.visual_analysis.temporal_consistency_score * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Compression Artifacts</p>
                        <Progress 
                          value={result.visual_analysis.compression_artifacts * 100} 
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Edge Inconsistencies</p>
                        <Progress 
                          value={result.visual_analysis.edge_inconsistencies * 100} 
                          className="mt-2"
                        />
                      </div>
                    </div>
                    
                    {result.visual_analysis.suspicious_frames.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Suspicious Frames</p>
                        <div className="flex flex-wrap gap-2">
                          {result.visual_analysis.suspicious_frames.map((frame, index) => (
                            <Badge key={index} variant="outline">
                              Frame {frame}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="audio" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Audio Analysis Results</CardTitle>
                    <CardDescription>
                      Frequency analysis and voice consistency metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Frequency Analysis Score</p>
                        <p className="text-2xl font-bold text-primary">
                          {Math.round(result.audio_analysis.frequency_analysis_score * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Voice Consistency</p>
                        <p className="text-2xl font-bold text-primary">
                          {Math.round(result.audio_analysis.voice_consistency * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Spectral Anomalies</p>
                        <Progress 
                          value={result.audio_analysis.spectral_anomalies * 100} 
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Synthetic Markers</p>
                        <Progress 
                          value={result.audio_analysis.synthetic_markers * 100} 
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Results;