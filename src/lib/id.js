import { nanoid } from 'nanoid';

export function createId(prefix = 'id') {
  return `${prefix}_${nanoid(10)}`;
}
