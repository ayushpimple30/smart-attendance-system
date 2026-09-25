import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Camera, Check, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function RegisterStudent() {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const registerMutation = trpc.attendance.registerStudent.useMutation();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImages([...capturedImages, imageData]);
        toast.success(`Image ${capturedImages.length + 1} captured`);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsCapturing(false);
    }
  };

  const removeCapturedImage = (index: number) => {
    setCapturedImages(capturedImages.filter((_, i) => i !== index));
  };

  const handleRegister = async () => {
    if (!studentId || !name) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (capturedImages.length < 5) {
      toast.error("Please capture at least 5 face images");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        studentId,
        name,
        email,
        faceImages: capturedImages,
      });
      toast.success("Student registered successfully!");
      setStudentId("");
      setName("");
      setEmail("");
      setCapturedImages([]);
    } catch (error) {
      toast.error("Failed to register student");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Register Student</h1>
        <p className="text-muted-foreground">Capture face images and register a new student</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Camera Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Face Capture</h2>

          {isCapturing ? (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
              />
              <canvas ref={canvasRef} className="hidden" width={640} height={480} />

              <div className="flex gap-2">
                <Button onClick={captureImage} className="flex-1" size="lg">
                  <Camera className="mr-2" size={20} />
                  Capture Image
                </Button>
                <Button onClick={stopCamera} variant="outline" size="lg">
                  Stop Camera
                </Button>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  📸 Captured: <span className="font-bold">{capturedImages.length}</span> images
                  (minimum 5 required)
                </p>
              </div>
            </div>
          ) : (
            <Button onClick={startCamera} size="lg" className="w-full">
              <Camera className="mr-2" size={20} />
              Start Camera
            </Button>
          )}
        </Card>

        {/* Right: Registration Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Student Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Student ID *</label>
              <Input
                placeholder="e.g., STU001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <Input
                placeholder="e.g., John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                placeholder="e.g., john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-3">Captured Images</h3>
              {capturedImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {capturedImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Captured ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeCapturedImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">No images captured yet</p>
              )}

              <Button
                onClick={handleRegister}
                disabled={registerMutation.isPending || capturedImages.length < 5}
                size="lg"
                className="w-full"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Registering...
                  </>
                ) : (
                  <>
                    <Check className="mr-2" size={20} />
                    Register Student
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-accent/5 to-accent/10">
        <div className="flex gap-4">
          <AlertCircle className="text-accent flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-semibold mb-2">Tips for Best Results</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ensure good lighting and clear visibility of the face</li>
              <li>• Capture images from different angles (front, left, right)</li>
              <li>• Avoid wearing sunglasses or hats during capture</li>
              <li>• Capture at least 10-20 images for better accuracy</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
