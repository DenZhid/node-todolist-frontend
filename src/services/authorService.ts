import { api } from "../api";
import type { Author } from "../types";

export async function getAuthor(): Promise<Author> {
  return api<Author>("/api/author/");
}
