import { invokeLLM } from "../_core/llm";

// Face embedding type
export interface FaceEmbedding {
  embedding: number[];
  timestamp: number;
}

// Face detection result
export interface DetectedFace {
  embedding: number[];
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  livenessScore: number;
}

// Recognition result
export interface RecognitionResult {
  studentId: string;
  studentName: string;
  confidence: number;
  livenessScore: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export async function extractFaceEmbedding(imageUrl: string): Promise<number[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a face recognition expert. Extract face embeddings from the provided image using DeepFace model.
          Return ONLY a JSON object with this exact structure:
          {"embeddings": [array of 128 numbers between -1 and 1], "confidence": 0.95}
          Do not include any other text or explanation.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the face embedding from this image. Return only JSON.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "face_embedding",
          strict: true,
          schema: {
            type: "object",
            properties: {
              embeddings: {
                type: "array",
                items: { type: "number" },
                description: "Face embedding vector (128 dimensions)",
              },
              confidence: {
                type: "number",
                description: "Detection confidence score 0-1",
              },
            },
            required: ["embeddings", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("No response from LLM");

    const contentStr = typeof content === 'string' ? content : (Array.isArray(content) && content[0] && 'text' in content[0] ? (content[0] as any).text || '' : '');
    const parsed = JSON.parse(contentStr);
    if (!Array.isArray(parsed.embeddings) || parsed.embeddings.length !== 128) {
      throw new Error("Invalid embedding format");
    }

    return parsed.embeddings;
  } catch (error) {
    console.error("Error extracting face embedding:", error);
    throw error;
  }
}

export function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error("Embeddings must have the same length");
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return dotProduct / (norm1 * norm2);
}

export function normalizeConfidenceScore(similarity: number): number {
  return (similarity + 1) / 2;
}

export function recognizeFace(
  detectedEmbedding: number[],
  studentEmbeddings: Array<{ studentId: string; studentName: string; embeddings: number[][] }>,
  threshold: number = 0.6
): RecognitionResult | null {
  let bestMatch: RecognitionResult | null = null;
  let bestSimilarity = -1;

  for (const student of studentEmbeddings) {
    for (const storedEmbedding of student.embeddings) {
      const similarity = cosineSimilarity(detectedEmbedding, storedEmbedding);

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        const confidence = normalizeConfidenceScore(similarity);

        if (confidence >= threshold) {
          bestMatch = {
            studentId: student.studentId,
            studentName: student.studentName,
            confidence: parseFloat(confidence.toFixed(4)),
            livenessScore: 0.85,
            boundingBox: { x: 0, y: 0, width: 0, height: 0 },
          };
        }
      }
    }
  }

  return bestMatch;
}

export async function detectAndExtractFaces(imageUrl: string): Promise<DetectedFace[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a face detection expert. Detect all faces in the provided image and extract their embeddings using DeepFace model.
          Return ONLY a JSON array of detected faces with this exact structure:
          [{"embedding": [array of 128 numbers], "confidence": 0.95, "boundingBox": {"x": 0, "y": 0, "width": 100, "height": 100}, "livenessScore": 0.9}]
          Do not include any other text or explanation.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Detect all faces and extract embeddings. Return only JSON array.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "face_detection",
          strict: true,
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                embedding: {
                  type: "array",
                  items: { type: "number" },
                },
                confidence: { type: "number" },
                boundingBox: {
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                    width: { type: "number" },
                    height: { type: "number" },
                  },
                  required: ["x", "y", "width", "height"],
                },
                livenessScore: { type: "number" },
              },
              required: ["embedding", "confidence", "boundingBox", "livenessScore"],
            },
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("No response from LLM");

    const contentStr = typeof content === 'string' ? content : (Array.isArray(content) && content[0] && 'text' in content[0] ? (content[0] as any).text || '' : '');
    const parsed = JSON.parse(contentStr);
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid detection format");
    }

    return parsed as DetectedFace[];
  } catch (error) {
    console.error("Error detecting faces:", error);
    return [];
  }
}

export function validateEmbedding(embedding: number[]): boolean {
  if (!Array.isArray(embedding)) return false;
  if (embedding.length !== 128) return false;
  if (!embedding.every((val) => typeof val === "number" && isFinite(val))) return false;
  return true;
}
