# Git Guide — From Zero to Pushed

Written assuming you've never used Git before. Do this in VS Code's built-in terminal
(Terminal → New Terminal, or Ctrl+` / Cmd+`).

---

## Part 1 — Get this project into your GitHub repo (you, the team lead)

### Step 1: Download the project files
Download the whole `ecosphere-esg` folder from this chat and open it in VS Code
(File → Open Folder).

### Step 2: Open the terminal inside that folder in VS Code
Make sure the terminal's current path ends in `ecosphere-esg`.

### Step 3: Turn this folder into a Git project
```bash
git init
```
This just tells Git "start tracking changes in this folder." Nothing is uploaded yet.

### Step 4: Connect it to your GitHub repo
Go to your GitHub repo page, click the green **Code** button, copy the HTTPS URL
(looks like `https://github.com/yourname/ecosphere-esg.git`). Then run:
```bash
git remote add origin PASTE_YOUR_URL_HERE
```

### Step 5: Stage and commit everything
```bash
git add .
git commit -m "Initial project setup: backend, frontend, schema, API contract"
```
- `git add .` = "include all these files in my next save point"
- `git commit -m "..."` = "actually save this checkpoint with a message describing it"

### Step 6: Push it to GitHub
```bash
git branch -M main
git push -u origin main
```
Refresh your GitHub repo page — the code should now be there.

---

## Part 2 — How your teammates get the code onto their laptop

Each teammate runs, once:
```bash
git clone https://github.com/yourname/ecosphere-esg.git
cd ecosphere-esg
```
This downloads a full copy of the project to their machine.

---

## Part 3 — The daily workflow for everyone (including you)

This is the part judges specifically check — **everyone should have their own commits**,
not just one person dumping all the code at the end.

### Before starting work each time: pull the latest changes
```bash
git pull origin main
```
This gets everyone else's latest work so you're not working on an outdated copy.

### Create a branch for your feature (recommended, keeps things clean)
```bash
git checkout -b carbon-tracking
```
(Replace `carbon-tracking` with whatever you're building — `csr-module`, `gamification`, etc.)

### As you work: save checkpoints often
```bash
git add .
git commit -m "Add carbon transaction API endpoint"
```
Do this every time you finish something meaningful — not just once at the end.

### Push your branch to GitHub
```bash
git push -u origin carbon-tracking
```

### Merge it into main when it's working
Easiest way for a hackathon (skip formal Pull Requests to save time):
```bash
git checkout main
git pull origin main
git merge carbon-tracking
git push origin main
```

If Git says there's a **merge conflict**, it means two people edited the same lines of the
same file. VS Code will show the conflicting file with `<<<<<<<` markers — just edit the
file to keep the correct version, then:
```bash
git add .
git commit -m "Resolve merge conflict"
git push origin main
```

---

## Quick reference — commands you'll use constantly

| Command | What it does |
|---|---|
| `git status` | Shows what's changed / staged / not yet committed |
| `git add .` | Stage all changed files |
| `git commit -m "message"` | Save a checkpoint with a description |
| `git pull origin main` | Get the latest code from GitHub |
| `git push origin main` | Upload your commits to GitHub |
| `git checkout -b name` | Create and switch to a new branch |
| `git log --oneline` | See commit history |

## Tips for your team
- Commit small and often — "Add login form UI" is better than one giant "final commit" at hour 6.
- Write commit messages that describe *what* changed, not "update" or "fix".
- If someone (like your partially-available teammate) can't push directly, they can email/send
  you their files and you commit on their behalf — but ideally they push themselves at least once
  so their GitHub username shows up in the contributor history, since judges may check this.
