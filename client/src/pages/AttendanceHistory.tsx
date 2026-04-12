import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AttendanceRecord {
  id: number;
  studentId: string;
  studentName: string;
  sessionName: string;
  timestamp: Date;
  confidenceScore: string;
  livenessScore: string | null;
}

export default function AttendanceHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [dateFilter, setDateFilter] = useState("");

  const getAllAttendanceQuery = trpc.attendance.getAllAttendance.useQuery({});
  const exportCSVQuery = trpc.attendance.exportAttendanceCSV.useQuery({});

  useEffect(() => {
    if (getAllAttendanceQuery.data) {
      let records = getAllAttendanceQuery.data;

      // Filter by search term
      if (searchTerm) {
        records = records.filter(
          (r) =>
            r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.studentId.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by date
      if (dateFilter) {
        records = records.filter((r) => {
          const recordDate = new Date(r.timestamp).toISOString().split("T")[0];
          return recordDate === dateFilter;
        });
      }

      setFilteredRecords(records);
    }
  }, [getAllAttendanceQuery.data, searchTerm, dateFilter]);

  const handleExportCSV = async () => {
    try {
      if (exportCSVQuery.data && exportCSVQuery.data.success) {
        const result = exportCSVQuery.data;
        const blob = new Blob([result.csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("CSV exported successfully!");
      }
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  const stats = {
    totalRecords: filteredRecords.length,
    uniqueStudents: new Set(filteredRecords.map((r) => r.studentId)).size,
    avgConfidence:
      filteredRecords.length > 0
        ? (
            filteredRecords.reduce((sum, r) => sum + parseFloat(r.confidenceScore), 0) /
            filteredRecords.length
          ).toFixed(2)
        : "0.00",
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Attendance History</h1>
        <p className="text-muted-foreground">View and manage attendance records</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <p className="text-muted-foreground text-sm mb-2">Total Records</p>
          <p className="text-3xl font-bold text-accent">{stats.totalRecords}</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm mb-2">Unique Students</p>
          <p className="text-3xl font-bold text-accent">{stats.uniqueStudents}</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm mb-2">Avg Confidence</p>
          <p className="text-3xl font-bold text-accent">{parseFloat(stats.avgConfidence) * 100}%</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Student</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Input
                placeholder="Name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleExportCSV}
              disabled={exportCSVQuery.isLoading}
              className="w-full"
            >
              <Download className="mr-2" size={18} />
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Records Table */}
      <Card className="p-6">
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Student Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Student ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Session</th>
                  <th className="text-left py-3 px-4 font-semibold">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold">Confidence</th>
                  <th className="text-left py-3 px-4 font-semibold">Liveness</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{record.studentName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{record.studentId}</td>
                    <td className="py-3 px-4 text-muted-foreground">{record.sessionName}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                        {(parseFloat(record.confidenceScore) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {record.livenessScore ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          {(parseFloat(record.livenessScore) * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {getAllAttendanceQuery.isLoading ? "Loading records..." : "No attendance records found"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
