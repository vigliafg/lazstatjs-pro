/** Remove generated build output without relying on shell-specific commands. */
import { rmSync } from 'node:fs';
import { join } from 'node:path';

for (const name of ['dist', 'dist-electron', 'release']) {
  rmSync(join(process.cwd(), name), { recursive: true, force: true });
}
