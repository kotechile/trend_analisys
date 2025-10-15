#!/usr/bin/env python3
"""
Fix import syntax errors caused by incorrect import placement
"""

import os
import re
from pathlib import Path

def fix_file_imports(file_path: Path):
    """Fix imports in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix broken import statements
        # Look for lines that start with "from src.core.supabase_database_service import SupabaseDatabaseService"
        # but are in the middle of other imports
        lines = content.split('\n')
        fixed_lines = []
        i = 0
        
        while i < len(lines):
            line = lines[i]
            
            # Check if this line is a broken import in the middle of another import
            if line.strip() == 'from src.core.supabase_database_service import SupabaseDatabaseService':
                # Check if the previous line is incomplete (ends with '(')
                if i > 0 and lines[i-1].strip().endswith('('):
                    # This is a broken import, skip it
                    i += 1
                    continue
                # Check if the next line continues the previous import
                elif i < len(lines) - 1 and lines[i+1].strip().startswith(('    ', '    ')):
                    # This is in the middle of a multi-line import, skip it
                    i += 1
                    continue
            
            fixed_lines.append(line)
            i += 1
        
        # Rejoin lines
        content = '\n'.join(fixed_lines)
        
        # Now properly add the SupabaseDatabaseService import if needed
        if 'SupabaseDatabaseService' in content and 'from src.core.supabase_database_service import SupabaseDatabaseService' not in content:
            # Find a good place to add the import
            lines = content.split('\n')
            insert_index = 0
            
            # Find the last import line
            for i, line in enumerate(lines):
                if line.strip().startswith(('import ', 'from ')) and not line.strip().startswith('#'):
                    insert_index = i + 1
            
            # Insert the import
            lines.insert(insert_index, 'from src.core.supabase_database_service import SupabaseDatabaseService')
            content = '\n'.join(lines)
        
        # Clean up multiple empty lines
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {file_path}")
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main fix function"""
    backend_dir = Path(__file__).parent
    src_dir = backend_dir / "src"
    
    if not src_dir.exists():
        print("Source directory not found")
        return
    
    fixed_files = []
    
    # Process all Python files
    for py_file in src_dir.rglob("*.py"):
        if fix_file_imports(py_file):
            fixed_files.append(py_file)
    
    print(f"\nFixed {len(fixed_files)} files:")
    for file_path in fixed_files:
        print(f"  - {file_path.relative_to(backend_dir)}")

if __name__ == "__main__":
    main()
