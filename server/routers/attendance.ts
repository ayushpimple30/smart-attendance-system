import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { extractFaceEmbedding, recognizeFace, validateEmbedding } from "../services/faceRecognition";
import { getDb } from "../db";
import { students, attendance, sessions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const attendanceRouter = router({
  // Register a new student with face images
  registerStudent: protectedProcedure
    .input(
      z.object({
        studentId: z.string().min(1),
        name: z.string().min(1),
        email: z.string().email().optional(),
        faceImages: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const embeddings: number[][] = [];

        for (const imageUrl of input.faceImages) {
          const embedding = await extractFaceEmbedding(imageUrl);
          if (validateEmbedding(embedding)) {
            embeddings.push(embedding);
          }
        }

        if (embeddings.length === 0) {
          throw new Error("No valid face embeddings extracted");
        }

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(students).values({
          studentId: input.studentId,
          name: input.name,
          email: input.email,
          embeddings: JSON.stringify(embeddings),
          imageCount: embeddings.length,
        });

        return {
          success: true,
          studentId: input.studentId,
          embeddingsCount: embeddings.length,
        };
      } catch (error) {
        console.error("Error registering student:", error);
        throw error;
      }
    }),

  // Get all students
  getAllStudents: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return [];

      try {
        const allStudents = await db.select().from(students);
        return allStudents.map((s) => ({
          id: s.id,
          studentId: s.studentId,
          name: s.name,
          email: s.email,
          embeddings: JSON.parse(s.embeddings),
          imageCount: s.imageCount,
        }));
      } catch (dbError) {
        console.error("Error fetching students:", dbError);
        return [];
      }
    } catch (error) {
      console.error("Error in getAllStudents:", error);
      return [];
    }
  }),

  // Create a new attendance session
  createSession: protectedProcedure
    .input(z.object({ sessionName: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(sessions).values({
          sessionName: input.sessionName,
          status: "active",
        });

        return {
          success: true,
          sessionId: result[0]?.insertId || 1,
          sessionName: input.sessionName,
        };
      } catch (error) {
        console.error("Error creating session:", error);
        throw error;
      }
    }),

  // Get active session
  getActiveSession: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return null;

      try {
        const activeSession = await db
          .select()
          .from(sessions)
          .where(eq(sessions.status, "active"))
          .limit(1);

        return activeSession.length > 0 ? activeSession[0] : null;
      } catch (dbError) {
        console.error("Error fetching active session:", dbError);
        return null;
      }
    } catch (error) {
      console.error("Error in getActiveSession:", error);
      return null;
    }
  }),

  // Recognize face and mark attendance
  recognizeAndMarkAttendance: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        detectedEmbedding: z.array(z.number()),
        confidenceThreshold: z.number().default(0.6),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const allStudents = await db.select().from(students);
        const studentEmbeddings = allStudents.map((s) => ({
          id: s.id,
          studentId: s.studentId,
          studentName: s.name,
          embeddings: JSON.parse(s.embeddings),
        }));

        const recognition = recognizeFace(input.detectedEmbedding, studentEmbeddings, input.confidenceThreshold);

        if (!recognition) {
          return {
            success: false,
            message: "Face not recognized",
          };
        }

        const student = allStudents.find((s) => s.studentId === recognition.studentId);
        if (!student) {
          return {
            success: false,
            message: "Student not found",
          };
        }

        const existingAttendance = await db
          .select()
          .from(attendance)
          .where(and(eq(attendance.sessionId, input.sessionId), eq(attendance.studentId, student.id)));

        if (existingAttendance.length > 0) {
          return {
            success: false,
            message: "Attendance already marked for this student in this session",
            studentName: recognition.studentName,
          };
        }

        await db.insert(attendance).values({
          sessionId: input.sessionId,
          studentId: student.id,
          confidenceScore: recognition.confidence.toString(),
          livenessScore: recognition.livenessScore.toString(),
          faceBoundingBox: JSON.stringify(recognition.boundingBox),
        });

        return {
          success: true,
          studentId: recognition.studentId,
          studentName: recognition.studentName,
          confidence: recognition.confidence,
          livenessScore: recognition.livenessScore,
        };
      } catch (error) {
        console.error("Error marking attendance:", error);
        throw error;
      }
    }),

  // Get attendance records for a session
  getSessionAttendance: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        try {
          const records = await db
            .select({
              id: attendance.id,
              studentId: students.studentId,
              studentName: students.name,
              timestamp: attendance.timestamp,
              confidenceScore: attendance.confidenceScore,
              livenessScore: attendance.livenessScore,
            })
            .from(attendance)
            .innerJoin(students, eq(attendance.studentId, students.id))
            .where(eq(attendance.sessionId, input.sessionId));

          return records;
        } catch (dbError) {
          console.error("Error fetching session attendance:", dbError);
          return [];
        }
      } catch (error) {
        console.error("Error in getSessionAttendance:", error);
        return [];
      }
    }),

  // Get all attendance records
  getAllAttendance: publicProcedure
    .input(
      z.object({
        studentId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        try {
          const records = await db
            .select({
              id: attendance.id,
              studentId: students.studentId,
              studentName: students.name,
              sessionName: sessions.sessionName,
              timestamp: attendance.timestamp,
              confidenceScore: attendance.confidenceScore,
              livenessScore: attendance.livenessScore,
            })
            .from(attendance)
            .innerJoin(students, eq(attendance.studentId, students.id))
            .innerJoin(sessions, eq(attendance.sessionId, sessions.id));

          return records;
        } catch (dbError) {
          console.error("Error fetching all attendance:", dbError);
          return [];
        }
      } catch (error) {
        console.error("Error in getAllAttendance:", error);
        return [];
      }
    }),

  // Get attendance statistics
  getAttendanceStats: publicProcedure
    .input(z.object({ sessionId: z.number().optional() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return {
            totalAttendance: 0,
            uniqueStudents: 0,
            totalStudents: 0,
            averageConfidence: 0,
            attendanceRate: 0,
          };
        }

        try {
          const allRecords = await db.select().from(attendance);
          const allStudents = await db.select().from(students);

          const filteredRecords = input.sessionId
            ? allRecords.filter((r) => r.sessionId === input.sessionId)
            : allRecords;

          const totalAttendance = filteredRecords.length;
          const uniqueStudents = new Set(filteredRecords.map((r) => r.studentId)).size;
          const avgConfidence =
            filteredRecords.length > 0
              ? filteredRecords.reduce((sum, r) => sum + parseFloat(r.confidenceScore), 0) / filteredRecords.length
              : 0;

          return {
            totalAttendance,
            uniqueStudents,
            totalStudents: allStudents.length,
            averageConfidence: parseFloat(avgConfidence.toFixed(4)),
            attendanceRate:
              allStudents.length > 0
                ? parseFloat(((uniqueStudents / allStudents.length) * 100).toFixed(2))
                : 0,
          };
        } catch (dbError) {
          console.error("Error calculating stats:", dbError);
          return {
            totalAttendance: 0,
            uniqueStudents: 0,
            totalStudents: 0,
            averageConfidence: 0,
            attendanceRate: 0,
          };
        }
      } catch (error) {
        console.error("Error in getAttendanceStats:", error);
        return {
          totalAttendance: 0,
          uniqueStudents: 0,
          totalStudents: 0,
          averageConfidence: 0,
          attendanceRate: 0,
        };
      }
    }),

  // Export attendance as CSV
  exportAttendanceCSV: publicProcedure
    .input(z.object({ sessionId: z.number().optional() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return {
            success: true,
            csv: "Student ID,Student Name,Session,Timestamp,Confidence,Liveness\n",
            filename: `attendance-${new Date().toISOString().split("T")[0]}.csv`,
          };
        }

        try {
          const records = await db
            .select({
              studentId: students.studentId,
              studentName: students.name,
              sessionName: sessions.sessionName,
              timestamp: attendance.timestamp,
              confidenceScore: attendance.confidenceScore,
              livenessScore: attendance.livenessScore,
            })
            .from(attendance)
            .innerJoin(students, eq(attendance.studentId, students.id))
            .innerJoin(sessions, eq(attendance.sessionId, sessions.id));

          const headers = ["Student ID", "Student Name", "Session", "Timestamp", "Confidence", "Liveness"];
          const rows = records.map((r) => [
            r.studentId,
            r.studentName,
            r.sessionName,
            new Date(r.timestamp).toISOString(),
            r.confidenceScore,
            r.livenessScore || "N/A",
          ]);

          const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

          return {
            success: true,
            csv,
            filename: `attendance-${new Date().toISOString().split("T")[0]}.csv`,
          };
        } catch (dbError) {
          console.error("Error exporting CSV:", dbError);
          // Return empty CSV on error instead of throwing
          return {
            success: true,
            csv: "Student ID,Student Name,Session,Timestamp,Confidence,Liveness\n",
            filename: `attendance-${new Date().toISOString().split("T")[0]}.csv`,
          };
        }
      } catch (error) {
        console.error("Error in exportAttendanceCSV:", error);
        return {
          success: true,
          csv: "Student ID,Student Name,Session,Timestamp,Confidence,Liveness\n",
          filename: `attendance-${new Date().toISOString().split("T")[0]}.csv`,
        };
      }
    }),
});
