/**
 * Recursive character text splitter to divide document text into optimal
 * chunks with overlap for RAG embeddings.
 */
export function recursiveSplitText(
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): string[] {
  if (!text || !text.trim()) return [];

  const cleanText = text.replace(/\r\n/g, "\n");
  const separators: string[] = ["\n\n", "\n", ". ", " ", ""];

  function splitRecursive(str: string, sepIndex: number): string[] {
    if (str.length <= chunkSize) {
      return [str];
    }

    if (sepIndex >= separators.length) {
      const chunks: string[] = [];
      let start = 0;
      const step = Math.max(1, chunkSize - chunkOverlap);
      while (start < str.length) {
        chunks.push(str.slice(start, start + chunkSize));
        start += step;
      }
      return chunks;
    }

    const sep = separators[sepIndex] ?? "";
    const parts = str.split(sep);
    const result: string[] = [];
    let current = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i] ?? "";
      const candidate = current ? current + sep + part : part;

      if (candidate.length <= chunkSize) {
        current = candidate;
      } else {
        if (current.trim()) {
          result.push(current.trim());
        }

        if (part.length > chunkSize) {
          const subChunks = splitRecursive(part, sepIndex + 1);
          result.push(...subChunks);
          current = "";
        } else {
          current = part;
        }
      }
    }

    if (current.trim()) {
      result.push(current.trim());
    }

    return result;
  }

  const rawChunks = splitRecursive(cleanText, 0);

  const finalChunks: string[] = [];
  for (let i = 0; i < rawChunks.length; i++) {
    const chunk = rawChunks[i];
    if (chunk && chunk.trim().length > 0) {
      finalChunks.push(chunk.trim());
    }
  }

  return finalChunks;
}
