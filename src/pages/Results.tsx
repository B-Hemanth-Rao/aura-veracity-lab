import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
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
  Copy,
  Share2
} from 'lucide-react';

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
  const { user } = useAuth();
  const [job, setJob] = useState<DetectionJob | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(true);

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
            <Link to="/dashboard">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const confidencePercentage = Math.round(result.confidence_score * 100);
  const isFake = result.prediction === 'FAKE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Analysis Results
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={copyResultsLink}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Verdict Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`bg-card/80 backdrop-blur-sm border-2 ${
              isFake ? 'border-destructive/50' : 'border-green-500/50'
            }`}>
              <CardContent className="p-8">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                      isFake ? 'bg-destructive/10' : 'bg-green-500/10'
                    }`}
                  >
                    {isFake ? (
                      <AlertTriangle className="w-10 h-10 text-destructive" />
                    ) : (
                      <Shield className="w-10 h-10 text-green-500" />
                    )}
                  </motion.div>
                  
                  <Badge 
                    variant={isFake ? "destructive" : "default"}
                    className={`text-lg px-4 py-2 mb-4 ${
                      !isFake ? 'bg-green-500 hover:bg-green-500/80' : ''
                    }`}
                  >
                    VERDICT: {result.prediction}
                  </Badge>
                  
                  <h2 className="text-3xl font-bold mb-2">
                    {confidencePercentage}% Confidence
                  </h2>
                  
                  <p className="text-muted-foreground">
                    File: {job.original_filename}
                  </p>
                  
                  <div className="mt-6">
                    <Progress 
                      value={confidencePercentage} 
                      className="h-3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analysis Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
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
    </div>
  );
};

export default Results;