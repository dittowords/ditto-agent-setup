// ditto — OpenCode plugin.
//
// Injects the Ditto instructions into every chat's system prompt and
// registers the /ditto-* commands and bundled skills. Reuses the same files
// the Claude Code plugin loads (hooks/ditto-instructions.md, skills/) so all
// hosts read one source of truth.
//
// OpenCode loads this as a server plugin — add it to your opencode.json:
//   { "plugin": ["<path-to-checkout>/.opencode/plugins/ditto.mjs"] }

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const instructionsPath = path.join(root, 'hooks', 'ditto-instructions.md');

// Local helper, deliberately not exported: OpenCode's legacy plugin loader
// treats every exported function as a plugin.
function parseCommandFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Tolerate CRLF from Windows checkouts.
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  const description = match[1].match(/description:\s*(.+)/)?.[1]?.trim();
  return { description, template: match[2].trim() };
}

export default async () => {
  return {
    // Register slash commands + the bundled skills directory.
    config: async (config) => {
      if (!config.command) config.command = {};
      const commandDir = path.join(__dirname, '..', 'command');
      try {
        for (const file of fs.readdirSync(commandDir).filter((f) => f.endsWith('.md'))) {
          const parsed = parseCommandFile(path.join(commandDir, file));
          if (parsed) config.command[path.basename(file, '.md')] = parsed;
        }
      } catch (e) {}

      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      const skillsDir = path.join(root, 'skills');
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },

    // Append the Ditto instructions to the system prompt every turn.
    'experimental.chat.system.transform': async (_input, output) => {
      let instructions;
      try {
        instructions = fs.readFileSync(instructionsPath, 'utf8').trim();
      } catch (e) {
        return;
      }
      if (output.system.length > 0) {
        output.system[output.system.length - 1] += '\n\n' + instructions;
      } else {
        output.system.push(instructions);
      }
    },
  };
};
