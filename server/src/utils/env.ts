export function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function mustGetStrongEnv(name: string): string {
  const value = mustGetEnv(name);
  if (/^change_me_/i.test(value)) {
    throw new Error(`Insecure env value for ${name}`);
  }
  return value;
}
