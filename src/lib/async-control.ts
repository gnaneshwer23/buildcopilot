export async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
): Promise<T[]> {
  const safeLimit = Math.max(1, limit);
  const results: T[] = new Array(tasks.length);
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const current = index;
      index += 1;
      results[current] = await tasks[current]();
    }
  }

  const workers = Array.from(
    { length: Math.min(safeLimit, tasks.length || 1) },
    () => worker(),
  );

  await Promise.all(workers);
  return results;
}
