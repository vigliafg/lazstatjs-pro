export interface CliIo {
  out: (text: string) => void;
  err: (text: string) => void;
}

export interface ParsedCli {
  command: string | null;
  positionals: string[];
  values: Record<string, string | boolean | string[] | undefined>;
}
