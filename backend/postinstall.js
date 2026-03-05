// Fix execute bit on node-pty spawn-helper (Mac only).
// On Windows/Linux this is a no-op.
import { chmodSync, existsSync } from 'fs';
import { join } from 'path';

if (process.platform === 'darwin') {
  const helper = join('node_modules', 'node-pty', 'prebuilds', 'darwin-arm64', 'spawn-helper');
  if (existsSync(helper)) {
    chmodSync(helper, 0o755);
    console.log('node-pty: fixed spawn-helper permissions');
  }
}
