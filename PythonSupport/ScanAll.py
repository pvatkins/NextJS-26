import os

directory_path = "C:/users/paul/OneDrive/Documents/NextJS/frontend/src/app" 
 # Replace with your directory

# Recursively scan the directories and files for thos entries
# that are files, wot within a node_modules directory, with
# sudffixes ending with .js, .jsx, .ts, or .tsx. Print the
# full path of each matching file found.
num = 0
for root, dirs, files in os.walk(directory_path):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            num = num + 1
            full_path = os.path.join(root, file)
            with open(full_path) as f:
                try:
                    s = f.read()
                    if  '=====' in s:
                        print(f"    ***** Found ===== in {full_path}")
                    lnum = 0
                    for line in s.splitlines():
                        lnum += 1
                        if '=====' in line:
                            print(f"{lnum, line}")
                except Exception as e:
                    print(f"    ***** Error reading {full_path}: {e}")
    
        
print(f"Total files scanned: {num}")