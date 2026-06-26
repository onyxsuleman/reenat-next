---
name: Large File Editing via Scratch Scripts
description: A technique for modifying specific text blocks inside source code files that exceed the file size limit of standard editing tools.
---

# Large File Editing via Scratch Scripts

This skill enables editing specific blocks of code in files that exceed the size limits of standard editing tools (e.g. files > 4MB).

## Trigger Conditions
- Standard file edit tools fail with file size limit errors.
- The file to edit contains heavy embedded resources (like base64 strings or large raw data arrays).

## Implementation Steps
1. Create a scratch Node.js script in the `<appDataDir>/brain/<conversation-id>/scratch/` directory.
2. In the script, read the target file using `fs.readFileSync(filePath, 'utf8')`.
3. Use a precise string search or a regular expression (`/pattern/`) to match the exact block to be modified.
4. Perform the replacement via `String.prototype.replace()`.
5. Write the modified content back using `fs.writeFileSync(filePath, updatedContent, 'utf8')`.
6. Run the script using `run_command` (e.g., `node <script_path>`).
7. Verify the changes using a diagnostic script or `git diff`.
