#!/usr/bin/env python3
"""
Script to fix Supabase imports after PostgreSQL removal
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
            # Find the database import line
            db_import_match = re.search(r'from src\.core\.database import get_db', content)
            if db_import_match:
                # Add SupabaseDatabaseService import after the database import
                insert_pos = db_import_match.end()
                content = content[:insert_pos] + '\nfrom src.core.supabase_database_service import SupabaseDatabaseService' + content[insert_pos:]
        
        # Fix any remaining Session references that should be SupabaseDatabaseService
        content = re.sub(r': Session(?!\w)', ': SupabaseDatabaseService', content)
        
        # Remove any remaining SQLAlchemy imports that might have been missed
        sqlalchemy_patterns = [
            r'from sqlalchemy[^\n]*\n',
            r'import sqlalchemy[^\n]*\n',
        ]
        
        for pattern in sqlalchemy_patterns:
            content = re.sub(pattern, '', content)
        
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
