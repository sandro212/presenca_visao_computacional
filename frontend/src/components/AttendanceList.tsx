import type { AttendanceRecord } from "../types";

interface AttendanceListProps {
  records: AttendanceRecord[];
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("pt-BR");
}

export function AttendanceList({ records }: AttendanceListProps) {
  if (records.length === 0) {
    return <p>Nenhuma presença registrada.</p>;
  }

  return (
    <table className="attendance-list">
      <thead>
        <tr>
          <th>Aluno</th>
          <th>Horário</th>
          <th>Confiança</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record.student_id}>
            <td>{record.name}</td>
            <td>{formatTime(record.timestamp)}</td>
            <td>{record.confidence.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
