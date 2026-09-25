import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Play, Square, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  confidence: number;
  livenessScore: number;
  timestamp: Date;
}

export default function LiveAttendance() {
  const [sessionName, setSessionName] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const createSessionMutation = trpc.attendance.createSession.useMutation();
  const recognizeAndMarkMutation = trpc.attendance.recognizeAndMarkAttendance.useMutation();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startSession = async () => {
    if (!sessionName.trim()) {
      toast.error("Please enter a session name");
      return;
    }

    try {
      const result = await createSessionMutation.mutateAsync({ sessionName });
      setIsSessionActive(true);
      setSessionId(1); // Mock session ID - would be returned from API
      toast.success("Session started successfully!");
      setSessionName("");
    } catch (error) {
      toast.error("Failed to start session");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      toast.error("Failed to access camera");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsCapturing(false);
    }
  };

  const captureAndRecognize = async () => {
    if (videoRef.current && canvasRef.current && sessionId) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        // In a real implementation, this would extract face embeddings
        // For now, we'll use a mock embedding
        const mockEmbedding = Array(128)
          .fill(0)
          .map(() => Math.random() * 2 - 1);

        try {
          const result = await recognizeAndMarkMutation.mutateAsync({
            sessionId,
            detectedEmbedding: mockEmbedding,
            confidenceThreshold: 0.6,
          });

          if (result.success) {
            toast.success(`Welcome ${result.studentName}!`);
            const newRecord: AttendanceRecord = {
              studentId: result.studentId || "",
              studentName: result.studentName || "",
              confidence: result.confidence || 0,
              livenessScore: result.livenessScore || 0,
              timestamp: new Date(),
            };
            setAttendanceRecords([newRecord, ...attendanceRecords]);
          } else {
            toast.error((result as any).message || "Face not recognized");
          }
        } catch (error) {
          toast.error("Error processing face");
        }
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Live Attendance Dashboard</h1>
        <p className="text-muted-foreground">Real-time face recognition and attendance marking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Video Feed */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Video Feed</h2>

            {isCapturing ? (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg bg-black aspect-video object-cover"
                />
                <canvas ref={canvasRef} className="hidden" width={640} height={480} />

                <div className="flex gap-2">
                  <Button onClick={captureAndRecognize} className="flex-1" size="lg">
                    📸 Capture & Recognize
                  </Button>
                  <Button onClick={stopCamera} variant="destructive" size="lg">
                    <Square className="mr-2" size={20} />
                    Stop
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={startCamera} size="lg" className="w-full" disabled={!isSessionActive}>
                <Play className="mr-2" size={20} />
                Start Camera
              </Button>
            )}
          </Card>
        </div>

        {/* Right: Session Control */}
        <div className="space-y-6">
          {/* Session Management */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Session Control</h2>

            {!isSessionActive ? (
              <div className="space-y-3">
                <Input
                  placeholder="Session name (e.g., Class A - Monday)"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                />
                <Button
                  onClick={startSession}
                  disabled={createSessionMutation.isPending}
                  size="lg"
                  className="w-full"
                >
                  {createSessionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2" size={20} />
                      Start Session
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    ✓ Session Active
                  </p>
                </div>
                <Button
                  onClick={() => setIsSessionActive(false)}
                  variant="destructive"
                  size="lg"
                  className="w-full"
                >
                  End Session
                </Button>
              </div>
            )}
          </Card>

          {/* Statistics */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Marked Today:</span>
                <span className="text-2xl font-bold text-accent">{attendanceRecords.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg Confidence:</span>
                <span className="font-medium">
                  {attendanceRecords.length > 0
                    ? (
                        attendanceRecords.reduce((sum, r) => sum + r.confidence, 0) /
                        attendanceRecords.length
                      ).toFixed(2)
                    : "N/A"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Attendance Records */}
      <Card className="mt-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Attendance</h2>

        {attendanceRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Student Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Student ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Time</th>
                  <th className="text-left py-3 px-4 font-semibold">Confidence</th>
                  <th className="text-left py-3 px-4 font-semibold">Liveness</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{record.studentName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{record.studentId}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {record.timestamp.toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                        {(record.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        {(record.livenessScore * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
        )}
      </Card>
    </div>
  );
}
