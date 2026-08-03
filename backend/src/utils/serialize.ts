import { Types } from 'mongoose';

type DocLike = {
  _id?: Types.ObjectId | string;
  toObject?: (options?: any) => any;
};

function serializeValue(value: unknown): unknown {
  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === 'object') {
    return serializeDoc(value as DocLike);
  }

  return value;
}

export function serializeDoc<T = Record<string, unknown>>(
  doc: DocLike | null | undefined
): T | null {
  if (!doc) {
    return null;
  }

  const raw =
    typeof doc.toObject === 'function'
      ? doc.toObject({ virtuals: false })
      : (doc as any);

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (key === '__v') {
      continue;
    }

    result[key] = serializeValue(value);
  }

  if (!result._id && result.id) {
    result._id = result.id;
    delete result.id;
  }

  return result as T;
}

export function serializeDocs<T = Record<string, unknown>>(
  docs: DocLike[]
): T[] {
  return docs
    .map((doc) => serializeDoc<T>(doc))
    .filter((doc): doc is T => doc !== null);
}
