import { describe, it, expect } from "vitest";
import {
  cosineSimilarity,
  normalizeConfidenceScore,
  recognizeFace,
  validateEmbedding,
} from "./faceRecognition";

describe("Face Recognition Service", () => {
  // Generate mock embeddings for testing
  const mockEmbedding1 = Array(128)
    .fill(0)
    .map(() => Math.random() * 2 - 1);
  const mockEmbedding2 = Array(128)
    .fill(0)
    .map(() => Math.random() * 2 - 1);
  const mockEmbedding3 = [...mockEmbedding1]; // Identical to embedding1

  describe("cosineSimilarity", () => {
    it("should return 1 for identical embeddings", () => {
      const similarity = cosineSimilarity(mockEmbedding1, mockEmbedding1);
      expect(similarity).toBeCloseTo(1, 5);
    });

    it("should return value between -1 and 1", () => {
      const similarity = cosineSimilarity(mockEmbedding1, mockEmbedding2);
      expect(similarity).toBeGreaterThanOrEqual(-1);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it("should throw error for different length embeddings", () => {
      const shortEmbedding = Array(64).fill(0.5);
      expect(() => cosineSimilarity(mockEmbedding1, shortEmbedding)).toThrow();
    });

    it("should handle zero vectors", () => {
      const zeroVector = Array(128).fill(0);
      const similarity = cosineSimilarity(zeroVector, mockEmbedding1);
      expect(similarity).toBe(0);
    });
  });

  describe("normalizeConfidenceScore", () => {
    it("should normalize -1 to 0", () => {
      const normalized = normalizeConfidenceScore(-1);
      expect(normalized).toBeCloseTo(0, 5);
    });

    it("should normalize 1 to 1", () => {
      const normalized = normalizeConfidenceScore(1);
      expect(normalized).toBeCloseTo(1, 5);
    });

    it("should normalize 0 to 0.5", () => {
      const normalized = normalizeConfidenceScore(0);
      expect(normalized).toBeCloseTo(0.5, 5);
    });

    it("should return value between 0 and 1", () => {
      for (let i = -1; i <= 1; i += 0.1) {
        const normalized = normalizeConfidenceScore(i);
        expect(normalized).toBeGreaterThanOrEqual(0);
        expect(normalized).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("validateEmbedding", () => {
    it("should accept valid 128-dimensional embedding", () => {
      const validEmbedding = Array(128).fill(0.5);
      expect(validateEmbedding(validEmbedding)).toBe(true);
    });

    it("should reject non-array", () => {
      expect(validateEmbedding("not an array" as any)).toBe(false);
    });

    it("should reject wrong dimension", () => {
      const wrongDim = Array(64).fill(0.5);
      expect(validateEmbedding(wrongDim)).toBe(false);
    });

    it("should reject non-numeric values", () => {
      const invalidEmbedding = Array(128).fill("not a number");
      expect(validateEmbedding(invalidEmbedding as any)).toBe(false);
    });

    it("should reject infinite values", () => {
      const invalidEmbedding = Array(128).fill(0.5);
      invalidEmbedding[0] = Infinity;
      expect(validateEmbedding(invalidEmbedding)).toBe(false);
    });

    it("should reject NaN values", () => {
      const invalidEmbedding = Array(128).fill(0.5);
      invalidEmbedding[0] = NaN;
      expect(validateEmbedding(invalidEmbedding)).toBe(false);
    });
  });

  describe("recognizeFace", () => {
    const studentEmbeddings = [
      {
        studentId: "STU001",
        studentName: "John Doe",
        embeddings: [mockEmbedding1, mockEmbedding3], // Two embeddings for same student
      },
      {
        studentId: "STU002",
        studentName: "Jane Smith",
        embeddings: [mockEmbedding2],
      },
    ];

    it("should recognize matching face with high confidence", () => {
      const result = recognizeFace(mockEmbedding1, studentEmbeddings, 0.6);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.studentId).toBe("STU001");
        expect(result.studentName).toBe("John Doe");
        expect(result.confidence).toBeGreaterThan(0.6);
      }
    });

    it("should return null for low confidence match", () => {
      const randomEmbedding = Array(128)
        .fill(0)
        .map(() => Math.random() * 2 - 1);
      const result = recognizeFace(randomEmbedding, studentEmbeddings, 0.95);
      expect(result).toBeNull();
    });

    it("should respect confidence threshold", () => {
      const result = recognizeFace(mockEmbedding1, studentEmbeddings, 0.99);
      // With very high threshold, might not match
      if (result) {
        expect(result.confidence).toBeGreaterThanOrEqual(0.99);
      }
    });

    it("should find best match among multiple embeddings", () => {
      const result = recognizeFace(mockEmbedding1, studentEmbeddings, 0.5);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.studentId).toBe("STU001");
      }
    });

    it("should handle empty student list", () => {
      const result = recognizeFace(mockEmbedding1, [], 0.6);
      expect(result).toBeNull();
    });

    it("should include liveness score in result", () => {
      const result = recognizeFace(mockEmbedding1, studentEmbeddings, 0.5);
      if (result) {
        expect(result.livenessScore).toBeDefined();
        expect(result.livenessScore).toBeGreaterThanOrEqual(0);
        expect(result.livenessScore).toBeLessThanOrEqual(1);
      }
    });

    it("should include bounding box in result", () => {
      const result = recognizeFace(mockEmbedding1, studentEmbeddings, 0.5);
      if (result) {
        expect(result.boundingBox).toBeDefined();
        expect(result.boundingBox.x).toBe(0);
        expect(result.boundingBox.y).toBe(0);
        expect(result.boundingBox.width).toBe(0);
        expect(result.boundingBox.height).toBe(0);
      }
    });
  });

  describe("Integration Tests", () => {
    it("should correctly process a complete recognition workflow", () => {
      // Create student embeddings
      const studentEmbedding = Array(128)
        .fill(0)
        .map(() => Math.random() * 2 - 1);
      const students = [
        {
          studentId: "STU001",
          studentName: "Test Student",
          embeddings: [studentEmbedding],
        },
      ];

      // Simulate detected face (same as registered)
      const detectedEmbedding = studentEmbedding;

      // Recognize face
      const result = recognizeFace(detectedEmbedding, students, 0.6);

      // Verify result
      expect(result).not.toBeNull();
      if (result) {
        expect(result.studentId).toBe("STU001");
        expect(result.studentName).toBe("Test Student");
        expect(result.confidence).toBeGreaterThan(0.9);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    });

    it("should handle multiple students with similar embeddings", () => {
      // Create similar but distinct embeddings
      const baseEmbedding = Array(128).fill(0.5);
      const embedding1 = baseEmbedding.map((v) => v + Math.random() * 0.1 - 0.05);
      const embedding2 = baseEmbedding.map((v) => v + Math.random() * 0.1 - 0.05);

      const students = [
        {
          studentId: "STU001",
          studentName: "Student 1",
          embeddings: [embedding1],
        },
        {
          studentId: "STU002",
          studentName: "Student 2",
          embeddings: [embedding2],
        },
      ];

      // Test with embedding1
      const result1 = recognizeFace(embedding1, students, 0.5);
      expect(result1?.studentId).toBe("STU001");

      // Test with embedding2
      const result2 = recognizeFace(embedding2, students, 0.5);
      expect(result2?.studentId).toBe("STU002");
    });
  });
});
