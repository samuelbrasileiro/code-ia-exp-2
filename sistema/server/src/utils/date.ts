export function dataHoje(): string {
  return new Date().toISOString().slice(0, 10);
}
