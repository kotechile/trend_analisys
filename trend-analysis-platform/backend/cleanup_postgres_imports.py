#!/usr/bin/env python3
"""
Script to remove PostgreSQL/SQLAlchemy imports and replace with Supabase
"""

import os
import re
from pathlib import Path

def cleanup_file(file_path: Path):
    """Clean up a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Remove SQLAlchemy imports
        sqlalchemy_imports = [
            r'from sqlalchemy[^\n]*\n',
            r'import sqlalchemy[^\n]*\n',
            r'from sqlalchemy\.[^\n]*\n',
        ]
        
        for pattern in sqlalchemy_imports:
            content = re.sub(pattern, '', content)
        
        # Remove PostgreSQL specific imports
        postgres_imports = [
            r'import psycopg2[^\n]*\n',
            r'from psycopg2[^\n]*\n',
            r'import psycopg[^\n]*\n',
            r'from psycopg[^\n]*\n',
        ]
        
        for pattern in postgres_imports:
            content = re.sub(pattern, '', content)
        
        # Remove alembic imports
        alembic_imports = [
            r'import alembic[^\n]*\n',
            r'from alembic[^\n]*\n',
        ]
        
        for pattern in alembic_imports:
            content = re.sub(pattern, '', content)
        
        # Replace Session imports with Supabase
        content = re.sub(
            r'from sqlalchemy\.orm import Session',
            'from src.core.supabase_database_service import SupabaseDatabaseService',
            content
        )
        
        # Replace get_db imports
        content = re.sub(
            r'from src\.core\.database import get_db',
            'from src.core.database import get_db',
            content
        )
        
        # Replace Session type hints
        content = re.sub(
            r': Session',
            ': SupabaseDatabaseService',
            content
        )
        
        # Replace db.query() calls with Supabase equivalents
        # This is a basic replacement - more complex queries need manual conversion
        content = re.sub(
            r'db\.query\(([^)]+)\)\.filter\(([^)]+)\)\.first\(\)',
            r'db.get_\1_by_id(\2)',
            content
        )
        
        # Remove empty lines that might have been created
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {file_path}")
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main cleanup function"""
    backend_dir = Path(__file__).parent
    src_dir = backend_dir / "src"
    
    if not src_dir.exists():
        print("Source directory not found")
        return
    
    updated_files = []
    
    # Process all Python files
    for py_file in src_dir.rglob("*.py"):
        if cleanup_file(py_file):
            updated_files.append(py_file)
    
    print(f"\nCleaned up {len(updated_files)} files:")
    for file_path in updated_files:
        print(f"  - {file_path.relative_to(backend_dir)}")

if __name__ == "__main__":
    main()
