#!/usr/bin/env python3
"""
Comprehensive script to fix all SupabaseDatabaseService imports
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
        
        # Check if file uses SupabaseDatabaseService but doesn't import it
        if 'SupabaseDatabaseService' in content and 'from src.core.supabase_database_service import SupabaseDatabaseService' not in content:
            # Find existing imports section
            import_patterns = [
                r'from src\.core\.database import get_db',
                r'from src\.core import database',
                r'import src\.core\.database',
            ]
            
            import_found = False
            for pattern in import_patterns:
                if re.search(pattern, content):
                    # Add SupabaseDatabaseService import after the database import
                    match = re.search(pattern, content)
                    if match:
                        insert_pos = match.end()
                        content = content[:insert_pos] + '\nfrom src.core.supabase_database_service import SupabaseDatabaseService' + content[insert_pos:]
                        import_found = True
                        break
            
            # If no database import found, add it at the top after other imports
            if not import_found:
                # Find the last import line
                import_lines = []
                lines = content.split('\n')
                last_import_line = -1
                
                for i, line in enumerate(lines):
                    if line.strip().startswith(('import ', 'from ')) and not line.strip().startswith('#'):
                        last_import_line = i
                
                if last_import_line >= 0:
                    # Insert after the last import
                    lines.insert(last_import_line + 1, 'from src.core.supabase_database_service import SupabaseDatabaseService')
                    content = '\n'.join(lines)
                else:
                    # Add at the beginning after the docstring
                    if content.strip().startswith('"""') or content.strip().startswith("'''"):
                        # Find end of docstring
                        docstring_end = content.find('"""', 3)
                        if docstring_end == -1:
                            docstring_end = content.find("'''", 3)
                        if docstring_end != -1:
                            docstring_end += 3
                            content = content[:docstring_end] + '\n\nfrom src.core.supabase_database_service import SupabaseDatabaseService' + content[docstring_end:]
                    else:
                        # Add at the very beginning
                        content = 'from src.core.supabase_database_service import SupabaseDatabaseService\n' + content
        
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
