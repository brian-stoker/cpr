# `cpr` – Git-Aware Copy Script

## Overview
`cpr` is a Bash utility for copying the contents of a Git repository **while respecting `.gitignore` rules**.  
It ensures that only files that are tracked by Git or explicitly untracked but **not ignored** are copied.  

It is designed to be a safe, minimal replacement for `cp` or `rsync` in workflows where you want a **clean copy** of your working tree without build artifacts, temporary files, or other ignored files.

---

## Features
- **Respects `.gitignore`** files at all levels of the repository.
- Copies:
  - Files tracked by Git (`git ls-files --cached`)
  - Untracked files not ignored (`git ls-files --others --exclude-standard`)
  - **The `.git` directory by default** (new: preserves full Git history)
- **Skips**:
  - Any files matching `.gitignore` rules
  - Missing files (no error spam)
  - The `.git` directory only when `--no-git` flag is used
- Preserves:
  - File timestamps
  - File permissions
  - Directory structure
  - Git repository state (by default)

---

## Requirements
- **macOS/Linux**: `bash` (v4+ recommended)
- **Windows**: Git Bash or WSL (Windows Subsystem for Linux)
- Git installed and available in `PATH`
- Node.js (v14+) for npm installation method
- The source directory must be **inside a Git repository**

---

## Installation

### Option 1: Install from npm (Recommended)

Once published to npm, you can install globally:

```bash
npm install -g cpr-cli
```

### Option 2: Install from Source

#### macOS / Linux

```bash
# Clone the repository
git clone https://github.com/yourusername/cpr.git
cd cpr

# Option A: Using npm (handles permissions automatically)
sudo npm run install

# Option B: Manual installation
sudo cp cpr /usr/local/bin/cpr
sudo chmod 755 /usr/local/bin/cpr
```

#### Windows

**Prerequisites**: Install [Git for Windows](https://git-scm.com/download/win) which includes Git Bash.

```bash
# Using Git Bash or PowerShell as Administrator
git clone https://github.com/yourusername/cpr.git
cd cpr

# Install using npm
npm run install
```

For Windows, the installer will:
- Copy the script to npm's global bin directory
- Create a `.cmd` wrapper for command prompt compatibility
- Require Git Bash to be installed for the bash script to run

#### Alternative: Direct Download

```bash
# macOS/Linux
curl -o /tmp/cpr https://raw.githubusercontent.com/yourusername/cpr/main/cpr
sudo mv /tmp/cpr /usr/local/bin/cpr
sudo chmod 755 /usr/local/bin/cpr

# Windows (Git Bash)
curl -o cpr https://raw.githubusercontent.com/yourusername/cpr/main/cpr
npm run install
```

### Verify Installation

After installation, verify it works:

```bash
cpr --help
```

---

## Usage
```bash
cpr [--no-git] <source> <destination>
```

### Options:
- `--no-git`: Exclude the `.git` directory from the copy (reverts to previous behavior)

### Examples:
Copy a repo with full Git history (default):
```bash
cpr ~/dev/my-project ~/tmp/my-project-clean
```

Copy a repo without Git history:
```bash
cpr --no-git ~/dev/my-project ~/tmp/my-project-clean
```

---

## What It **DOES**
- Creates an exact copy of your Git working directory **minus ignored files**.
- **Includes the `.git` directory by default**, making the destination a full Git repository.
- Handles nested `.gitignore` rules automatically.
- Copies both tracked and untracked-but-not-ignored files.
- Preserves directory structure exactly.
- Works with repositories on any branch or commit state.
- Parallelized High-Performance Version

---

## What It **DOES NOT** Do
- ❌ Does **not** copy `.git` metadata when `--no-git` flag is used.
- ❌ Does **not** include files excluded by `.gitignore`, `.git/info/exclude`, or global Git ignore settings.
- ❌ Does **not** perform differential sync — it always copies all matching files fresh.
- ❌ Does **not** copy outside of the Git repository’s root.

---

## Internals
The script:
1. Parses command-line flags (e.g., `--no-git`).
2. Resolves absolute paths for both source and destination.
3. Checks that the source is a Git repository.
3. Uses:
   ```bash
   git ls-files --cached --others --exclude-standard
   ```
   to get a clean file list.
4. Loops through each file, creating directories as needed.
5. Copies files with:
   ```bash
   cp -p
   ```
   to preserve timestamps and permissions.
6. Copies the `.git` directory with `cp -rp` (unless `--no-git` is specified).

---

## Troubleshooting
- **`Error: <path> is not a git repository`**  
  Ensure you point the source to the **root of a Git repo** or any folder inside it.

- **Files you expected aren’t copied**  
  Check your `.gitignore` — if Git ignores them, `cpr` will too.
