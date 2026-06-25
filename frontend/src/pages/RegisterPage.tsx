import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { createStudent, listStudents } from "../services/api";
import { StudentList } from "../components/StudentList";
import type { Student } from "../types";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listStudents().then(setStudents).catch(() => {
      setMessage("Erro ao carregar alunos.");
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!photo || !name.trim()) return;
    const form = event.currentTarget;

    setSubmitting(true);
    setMessage(null);
    try {
      const student = await createStudent(name.trim(), photo);
      setStudents((current) => [...current, student]);
      setName("");
      setPhoto(null);
      form.reset();
      setMessage(`Aluno ${student.name} cadastrado com sucesso.`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        setMessage(String(error.response.data.detail));
      } else {
        setMessage("Erro ao cadastrar aluno.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Cadastro de Alunos</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <label>
          Nome
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label>
          Foto
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
      <h3>Alunos cadastrados</h3>
      <StudentList students={students} />
    </section>
  );
}
