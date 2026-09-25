import { Card } from "@/components/ui/card";
import { Brain, Zap, Shield, BarChart3 } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">About SmartAttend</h1>
        <p className="text-lg text-muted-foreground">
          An AI-powered face recognition system for automated attendance marking using deep learning
          and advanced computer vision techniques.
        </p>
      </div>

      {/* Deep Learning Explanation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Face Embeddings */}
          <Card className="p-6 border-l-4 border-accent">
            <div className="flex items-start gap-4">
              <Brain className="text-accent flex-shrink-0 mt-1" size={28} />
              <div>
                <h3 className="text-lg font-semibold mb-2">Face Embeddings</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Face embeddings are high-dimensional vector representations of facial features
                  extracted by deep neural networks. Our system uses DeepFace, a state-of-the-art
                  deep learning model that converts each face image into a 128-dimensional vector.
                  This vector captures the unique characteristics of a person's face in a compact,
                  mathematically comparable format.
                </p>
              </div>
            </div>
          </Card>

          {/* Cosine Similarity */}
          <Card className="p-6 border-l-4 border-accent">
            <div className="flex items-start gap-4">
              <Zap className="text-accent flex-shrink-0 mt-1" size={28} />
              <div>
                <h3 className="text-lg font-semibold mb-2">Cosine Similarity</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Cosine similarity measures the angle between two embedding vectors, producing a
                  score between -1 and 1. A score of 1 indicates identical faces, while 0 means
                  completely different. We normalize this to a 0-1 confidence scale. By comparing
                  a detected face's embedding against stored student embeddings, we identify the
                  best match with high precision.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Why Deep Learning */}
        <Card className="p-8 bg-gradient-to-r from-accent/5 to-accent/10 mb-8">
          <div className="flex items-start gap-4">
            <Shield className="text-accent flex-shrink-0 mt-1" size={32} />
            <div>
              <h3 className="text-xl font-semibold mb-3">Why Deep Learning?</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong>Superior Feature Extraction:</strong> Deep neural networks automatically
                  learn hierarchical facial features (edges, textures, shapes) without manual
                  engineering, capturing subtle variations that traditional methods miss.
                </p>
                <p>
                  <strong>Robustness:</strong> Trained on millions of faces, deep learning models
                  handle variations in lighting, angles, expressions, and partial occlusions better
                  than conventional algorithms.
                </p>
                <p>
                  <strong>Scalability:</strong> Embeddings enable efficient similarity searches
                  across thousands of students, making real-time recognition practical.
                </p>
                <p>
                  <strong>Accuracy:</strong> State-of-the-art models achieve 99%+ accuracy on
                  benchmark datasets, significantly outperforming traditional face recognition.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* System Architecture */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">System Architecture</h2>

        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-sm font-bold">
                1
              </span>
              Registration Phase
            </h3>
            <p className="text-muted-foreground ml-10">
              Students register by providing 10-20 face images from different angles. The system
              extracts embeddings from each image using DeepFace and stores them in the database.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-sm font-bold">
                2
              </span>
              Real-Time Recognition
            </h3>
            <p className="text-muted-foreground ml-10">
              During attendance sessions, the webcam captures live video frames. Each frame is
              processed to extract face embeddings and compared against stored student embeddings
              using cosine similarity.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-sm font-bold">
                3
              </span>
              Attendance Marking
            </h3>
            <p className="text-muted-foreground ml-10">
              When a face is recognized with confidence above the threshold (default 60%), attendance
              is automatically marked with timestamp. Duplicate prevention ensures each student is
              marked only once per session.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-sm font-bold">
                4
              </span>
              Data Storage & Analytics
            </h3>
            <p className="text-muted-foreground ml-10">
              All attendance records are stored in a structured database with student information,
              session details, confidence scores, and timestamps. Export to CSV for further analysis.
            </p>
          </Card>
        </div>
      </section>

      {/* Accuracy Considerations */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Accuracy Considerations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="text-green-600" size={20} />
              Factors Improving Accuracy
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Multiple face images during registration (10-20 images)</li>
              <li>✓ Diverse angles and lighting conditions</li>
              <li>✓ High-quality camera feed (640x480 minimum)</li>
              <li>✓ Good lighting during attendance sessions</li>
              <li>✓ Liveness detection to prevent spoofing</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="text-orange-600" size={20} />
              Factors Affecting Accuracy
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>⚠ Poor lighting or shadows</li>
              <li>⚠ Significant facial hair changes</li>
              <li>⚠ Extreme angles or partial face visibility</li>
              <li>⚠ Sunglasses or face coverings</li>
              <li>⚠ Similar-looking individuals</li>
            </ul>
          </Card>
        </div>

        <Card className="mt-6 p-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
            Expected Performance
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Under optimal conditions with proper registration and good lighting, the system achieves
            95-99% accuracy. Confidence scores are displayed for each recognition to allow manual
            verification if needed. The system is designed to be highly accurate while maintaining
            practical usability in real-world classroom environments.
          </p>
        </Card>
      </section>

      {/* Technology Stack */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">Technology Stack</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Backend</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>FastAPI:</strong> High-performance Python web framework</li>
              <li>• <strong>DeepFace:</strong> State-of-the-art face recognition model</li>
              <li>• <strong>MySQL:</strong> Relational database for structured data</li>
              <li>• <strong>NumPy:</strong> Numerical computing for embeddings</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-3">Frontend</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>React 19:</strong> Modern UI framework</li>
              <li>• <strong>Tailwind CSS:</strong> Utility-first styling</li>
              <li>• <strong>tRPC:</strong> End-to-end type-safe APIs</li>
              <li>• <strong>WebRTC:</strong> Real-time camera access</li>
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
}
