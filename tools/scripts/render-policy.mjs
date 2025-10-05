import { readFile } from 'node:fs/promises';
import process from 'node:process';

async function main() {
  const policyRaw = await readFile(new URL('../../docs/render-policy.md', import.meta.url), 'utf8');
  let policy;

  try {
    policy = JSON.parse(policyRaw);
  } catch (error) {
    console.error('Failed to parse docs/render-policy.md as JSON.');
    throw error;
  }

  const selectedKey = policy.selectedOption;
  if (!selectedKey) {
    throw new Error('selectedOption missing in render policy');
  }

  const selected = policy.options?.[selectedKey];
  if (!selected) {
    throw new Error(`Option ${selectedKey} not defined in render policy options`);
  }

  const result = {
    selectedOption: selectedKey,
    ssrRoutes: selected.ssr ?? [],
    ssgRoutes: selected.ssg ?? [],
    description: selected.description ?? null,
  };

  process.stdout.write(JSON.stringify(result));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
