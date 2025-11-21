# cpr – Git-Aware Copy Script

## Overview

`cpr` is a Bash utility for copying Git repositories while respecting `.gitignore` rules. It copies only files tracked by Git or explicitly untracked but not ignored, making it ideal for creating clean copies of working trees without build artifacts or temporary files.

## Features

**Git Integration**
- Respects `.gitignore` files at all levels
- Preserves `.git` directory by default (full repository history)
- Supports Git worktrees (automatically finds and copies main repository)
- Handles nested repositories correctly

**Smart Destination Handling**
- Auto-removes clean destinations (all changes committed and pushed)
- Interactive prompts for destinations with uncommitted or unpushed changes
- Configurable behavior via `--force` and `--clean` flags

**File Handling**
- Copies tracked files and untracked non-ignored files
- Preserves timestamps, permissions, and directory structure
- Parallel file operations for improved performance
- Skips files matching `.gitignore` patterns

## Installation

### Via npm (Recommended)

```bash
npm install -g cpr-cli
```

### From Source

**macOS / Linux:**
```bash
git clone https://github.com/brian-stoker/cpr.git
cd cpr
sudo cp cpr /usr/local/bin/cpr
sudo chmod +x /usr/local/bin/cpr
```

**Windows (Git Bash):**
```bash
git clone https://github.com/brian-stoker/cpr.git
cd cpr
npm run install
```

### Verify Installation

```bash
cpr --help
```

## Usage

```bash
cpr [--no-git] [--force] [--clean] <source> <destination>
```

### Options

**`--no-git`**
Exclude the `.git` directory from copy (files only, no repository data)

**`--force`**
Skip all safety checks and prompts. Overwrites destination without confirmation.

**`--clean`**
Remove destination directory before copying, ensuring a fresh start.

## Examples

### Basic Usage

Copy repository with full Git history:
```bash
cpr ~/dev/my-project ~/backup/my-project
```

Copy files only (no Git data):
```bash
cpr --no-git ~/dev/my-project ~/deploy/my-project
```

### Git Worktree Support

When copying from a worktree, `cpr` automatically finds and copies the main repository's `.git` directory:

```bash
# Create a worktree
cd ~/dev/my-project
git worktree add ../feature-branch feature

# Copy the worktree (includes main repo's .git)
cpr ../feature-branch ~/backup/feature-branch
```

The destination will be a complete repository, not a worktree reference.

### Destination Handling

**Empty destination** - No prompts, just copies:
```bash
cpr ~/dev/project ~/new-location
```

**Clean destination** (all changes pushed) - Auto-removes and copies:
```bash
cpr ~/dev/project ~/existing-clean-repo
# Output: "Destination is a clean git repo (all changes pushed). Removing and recreating..."
```

**Dirty destination** (uncommitted/unpushed changes) - Interactive prompt:
```bash
cpr ~/dev/project ~/existing-dirty-repo
# Output:
# ⚠️  Destination has uncommitted or unpushed changes:
#   - Untracked files present
#   - Uncommitted changes present
#   - Unpushed commits present
#
# Choose an action:
#   1) Cancel - Stop without making changes
#   2) Clean  - Remove destination and copy fresh (DESTRUCTIVE)
#   3) Overwrite - Keep destination, overwrite matching files
#
# Enter choice (1/2/3):
```

**Non-git destination** with files - Confirmation prompt:
```bash
cpr ~/dev/project ~/some-folder-with-files
# Output:
# ⚠️  Destination is not a git repo but contains files
#
# Overwrite files in destination? (y/N):
```

### Force and Clean Flags

Skip all prompts and overwrite:
```bash
cpr --force ~/dev/project ~/existing-repo
```

Always start fresh (removes destination first):
```bash
cpr --clean ~/dev/project ~/existing-repo
```

Combine flags:
```bash
cpr --clean --no-git ~/dev/project ~/deploy
```

## Behavior Details

### What Gets Copied

**Included by default:**
- All tracked files (`git ls-files --cached`)
- Untracked files not matching `.gitignore` (`git ls-files --others --exclude-standard`)
- The `.git` directory (full repository, including history, branches, tags)
- For worktrees: The main repository's `.git` directory (not the worktree reference file)

**Excluded:**
- Files matching `.gitignore` patterns
- Files outside the repository root
- The `.git` directory if `--no-git` flag is used

### Destination States

**Empty:**
No files present. Copies without prompts.

**Clean Git Repository:**
Git repository with no untracked files, no uncommitted changes, and no unpushed commits. Automatically removed and recreated.

**Dirty Git Repository:**
Git repository with untracked files, uncommitted changes, or unpushed commits. Prompts user for action (cancel/clean/overwrite).

**Non-Git Directory:**
Directory containing files but no Git repository. Prompts for confirmation before overwriting.

**Force Mode (`--force`):**
Skips all checks and prompts. Overwrites matching files without confirmation.

**Clean Mode (`--clean`):**
Always removes destination directory before copying, regardless of state.

## Requirements

- Bash (v4+ recommended)
- Git installed and in PATH
- Source directory must be inside a Git repository
- For Windows: Git Bash or WSL

## How It Works

1. Parse command-line flags
2. Resolve absolute paths for source and destination
3. Check destination state (empty/clean/dirty/non-git)
4. Handle destination according to state and flags
5. Use `git ls-files --cached --others --exclude-standard` to get file list
6. Copy files in parallel (8 concurrent operations) with `cp -p` to preserve metadata
7. Handle `.git` directory:
   - If source is a worktree: Find and copy main repository's `.git` directory
   - If source is regular repo: Copy `.git` directory
   - If `--no-git`: Skip `.git` entirely

## Troubleshooting

**"Error: Not a git repository"**
Source must be inside a Git repository. Navigate to repository root or any subdirectory.

**"Expected files not copied"**
Check `.gitignore` - ignored files are intentionally skipped.

**"Warning: Could not find main .git directory"**
Worktree detection found a `.git` file but couldn't locate main repository. Verify worktree setup with `git worktree list`.

**"Destination has uncommitted changes" prompt appears unexpectedly**
Destination is a Git repository with uncommitted work. Use `--force` to skip prompt or commit/push changes first.

## License

MIT
