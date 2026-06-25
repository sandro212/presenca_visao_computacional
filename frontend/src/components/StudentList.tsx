import type { Student } from "../types";
import { studentPhotoUrl } from "../services/api";

interface StudentListProps {
  students: Student[];
}

export function StudentList({ students }: StudentListProps) {
  if (students.length === 0) {
    return <p>Nenhum aluno cadastrado.</p>;
  }

  return (
    <ul className="student-list">
      {students.map((student) => (
        <li key={student.id}>
          <img
            src={studentPhotoUrl(student.photo)}
            alt={student.name}
            width={48}
            height={48}
          />
          <span>{student.name}</span>
        </li>
      ))}
    </ul>
  );
}
