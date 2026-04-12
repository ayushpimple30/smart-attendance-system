import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Camera, BarChart3, Zap, Shield } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-accent">SmartAttend</div>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
              <Link href="/attendance">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          ) : (
            <Button onClick={() => (window.location.href = getLoginUrl())}>Login</Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            AI-Powered Face Recognition
            <span className="block text-accent">Attendance System</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Automate attendance marking with state-of-the-art deep learning. Real-time face
            recognition, instant marking, and comprehensive analytics.
          </p>
          {isAuthenticated ? (
            <Link href="/attendance">
              <Button size="lg" className="gap-2">
                <Camera size={20} />
                Start Live Attendance
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={() => (window.location.href = getLoginUrl())}>
              Get Started
            </Button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Camera className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Real-Time Recognition</h3>
            <p className="text-sm text-muted-foreground">
              Instant face detection and recognition from webcam feed
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Deep Learning</h3>
            <p className="text-sm text-muted-foreground">
              State-of-the-art DeepFace model for 99% accuracy
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <BarChart3 className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive attendance reports and statistics
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Liveness Detection</h3>
            <p className="text-sm text-muted-foreground">
              Anti-spoofing with blink and motion detection
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <div className="bg-card rounded-xl p-12 border border-border mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Register</h3>
              <p className="text-sm text-muted-foreground">
                Capture 10-20 face images from different angles
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Extract</h3>
              <p className="text-sm text-muted-foreground">
                Generate face embeddings using deep learning
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Recognize</h3>
              <p className="text-sm text-muted-foreground">
                Real-time face recognition using cosine similarity
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Mark</h3>
              <p className="text-sm text-muted-foreground">
                Automatic attendance marking with timestamp
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-12 text-center border border-accent/20">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Transform Attendance?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join institutions worldwide using SmartAttend for accurate, efficient, and modern
            attendance management.
          </p>
          {isAuthenticated ? (
            <Link href="/register">
              <Button size="lg">Register Your First Student</Button>
            </Link>
          ) : (
            <Button size="lg" onClick={() => (window.location.href = getLoginUrl())}>
              Start Free Today
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>SmartAttend - AI-Powered Attendance System</p>
          <p className="mt-2">
            Built with React, FastAPI, and Deep Learning | Powered by DeepFace
          </p>
        </div>
      </footer>
    </div>
  );
}
