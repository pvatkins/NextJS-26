import os

# Root of your NextJS project (adjust if needed)
directory_path = "C:/Users/Paul/OneDrive/Documents/NextJS"

# File extensions to scan
valid_extensions = ('.js', '.jsx', '.ts', '.tsx')

# Exact Git conflict markers
conflict_markers = ["<<<<<<< ", "=======", ">>>>>>> "]

num_scanned = 0
num_conflicted_files = 0

print("🔍 Scanning for Git conflict markers...\n")

for root, dirs, files in os.walk(directory_path):
    # Skip generated/build directories
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.next' in dirs:
        dirs.remove('.next')
    if 'dist' in dirs:
        dirs.remove('dist')

    for file in files:
        if file.endswith(valid_extensions):
            num_scanned += 1
            full_path = os.path.join(root, file)
            try:
                with open(full_path, encoding="utf-8") as f:
                    s = f.read()
                    if any(marker in s for marker in conflict_markers):
                        num_conflicted_files += 1
                        print(f"⚠️  Conflict markers found in {full_path}")
                        lnum = 0
                        for line in s.splitlines():
                            lnum += 1
                            for marker in conflict_markers:
                                if marker in line:
                                    print(f"   Line {lnum}: {line.strip()}")
                        print()
            except Exception as e:
                print(f"❌ Error reading {full_path}: {e}")

print("✅ Scan complete.")
print(f"   Total files scanned: {num_scanned}")
print(f"   Files with conflicts: {num_conflicted_files}")
