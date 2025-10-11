#!/usr/bin/env python3
"""
Validation script to ensure PostgreSQL/SQLAlchemy is not used in active codebase.
Only Supabase SDK should be used for database operations.
"""

import os
import sys
import re
from pathlib import Path
from typing import List, Dict, Any

def find_postgresql_usage(root_dir: str) -> Dict[str, List[str]]:
    """
    Find all PostgreSQL/SQLAlchemy usage in the codebase.
    
    Returns:
        Dict with file paths and line numbers where PostgreSQL/SQLAlchemy is found
    """
    postgres_patterns = [
        r'import\s+sqlalchemy',
        r'from\s+sqlalchemy',
        r'import\s+psycopg2',
        r'from\s+psycopg2',
        r'import\s+alembic',
        r'from\s+alembic',
        r'postgresql://',
        r'postgres://',
        r'psycopg2-binary',
        r'sqlalchemy\.',
        r'create_engine',
        r'sessionmaker',
        r'declarative_base',
        r'Column\(',
        r'relationship\s*\(',
        r'ForeignKey\(',
        r'Index\(',
        r'MetaData\(',
        r'QueuePool\(',
        r'text\(',
        r'func\.',
        r'event\.',
        r'DATABASE_URL',
        r'alembic\.ini'
    ]
    
    results = {
        'postgresql_imports': [],
        'sqlalchemy_usage': [],
        'database_urls': [],
        'alembic_usage': [],
        'legacy_files': []
    }
    
    # Files to exclude from validation (legacy, migration scripts, etc.)
    exclude_patterns = [
        'migration',
        'legacy',
        'test_',
        'validate_migration',
        'migrate_to_supabase',
        'alembic/',
        '__pycache__',
        '.git',
        'node_modules',
        'venv/',
        'legacy_backup/',
        'site-packages/',
        'validate_supabase_only.py',
        'cleanup_legacy_postgres.py'
    ]
    
    root_path = Path(root_dir)
    
    for file_path in root_path.rglob('*.py'):
        # Skip excluded files
        if any(pattern in str(file_path) for pattern in exclude_patterns):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
                for line_num, line in enumerate(lines, 1):
                    line_lower = line.lower()
                    
                    # Check for PostgreSQL imports
                    if any(re.search(pattern, line_lower) for pattern in postgres_patterns[:6]):
                        results['postgresql_imports'].append(f"{file_path}:{line_num}: {line.strip()}")
                    
                    # Check for SQLAlchemy usage
                    elif any(re.search(pattern, line_lower) for pattern in postgres_patterns[6:12]):
                        results['sqlalchemy_usage'].append(f"{file_path}:{line_num}: {line.strip()}")
                    
                    # Check for database URLs
                    elif any(re.search(pattern, line_lower) for pattern in postgres_patterns[12:14]):
                        results['database_urls'].append(f"{file_path}:{line_num}: {line.strip()}")
                    
                    # Check for Alembic usage
                    elif any(re.search(pattern, line_lower) for pattern in postgres_patterns[14:16]):
                        results['alembic_usage'].append(f"{file_path}:{line_num}: {line.strip()}")
                        
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    return results

def find_supabase_usage(root_dir: str) -> Dict[str, List[str]]:
    """
    Find all Supabase SDK usage in the codebase.
    
    Returns:
        Dict with file paths and line numbers where Supabase is used
    """
    supabase_patterns = [
        r'import\s+supabase',
        r'from\s+supabase',
        r'create_client',
        r'supabase\.',
        r'SUPABASE_URL',
        r'SUPABASE_KEY',
        r'SUPABASE_ANON_KEY',
        r'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    results = {
        'supabase_imports': [],
        'supabase_usage': [],
        'supabase_config': []
    }
    
    root_path = Path(root_dir)
    
    for file_path in root_path.rglob('*.py'):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
                for line_num, line in enumerate(lines, 1):
                    line_lower = line.lower()
                    
                    # Check for Supabase imports
                    if any(re.search(pattern, line_lower) for pattern in supabase_patterns[:2]):
                        results['supabase_imports'].append(f"{file_path}:{line_num}: {line.strip()}")
                    
                    # Check for Supabase usage
                    elif any(re.search(pattern, line_lower) for pattern in supabase_patterns[2:4]):
                        results['supabase_usage'].append(f"{file_path}:{line_num}: {line.strip()}")
                    
                    # Check for Supabase config
                    elif any(re.search(pattern, line_lower) for pattern in supabase_patterns[4:]):
                        results['supabase_config'].append(f"{file_path}:{line_num}: {line.strip()}")
                        
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    return results

def validate_requirements_txt(requirements_path: str) -> Dict[str, Any]:
    """
    Validate that requirements.txt only contains Supabase dependencies.
    
    Returns:
        Dict with validation results
    """
    postgres_deps = ['sqlalchemy', 'alembic', 'psycopg2', 'psycopg2-binary']
    supabase_deps = ['supabase', 'python-dotenv']
    
    results = {
        'postgres_dependencies': [],
        'supabase_dependencies': [],
        'other_dependencies': [],
        'is_valid': True
    }
    
    try:
        with open(requirements_path, 'r') as f:
            lines = f.readlines()
            
            for line in lines:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                
                dep_name = line.split('==')[0].split('>=')[0].split('<=')[0]
                
                if any(pg_dep in dep_name.lower() for pg_dep in postgres_deps):
                    results['postgres_dependencies'].append(line)
                    results['is_valid'] = False
                elif any(sb_dep in dep_name.lower() for sb_dep in supabase_deps):
                    results['supabase_dependencies'].append(line)
                else:
                    results['other_dependencies'].append(line)
                    
    except Exception as e:
        print(f"Error reading {requirements_path}: {e}")
        results['is_valid'] = False
    
    return results

def main():
    """Main validation function."""
    print("🔍 Validating Supabase-only implementation...")
    print("=" * 60)
    
    # Get project root
    script_dir = Path(__file__).parent
    backend_dir = script_dir
    
    print(f"📁 Scanning directory: {backend_dir}")
    print()
    
    # Find PostgreSQL/SQLAlchemy usage
    print("🚫 Checking for PostgreSQL/SQLAlchemy usage...")
    postgres_usage = find_postgresql_usage(str(backend_dir))
    
    postgres_found = False
    for category, items in postgres_usage.items():
        if items:
            postgres_found = True
            print(f"❌ {category.upper()}:")
            for item in items:
                print(f"   {item}")
            print()
    
    if not postgres_found:
        print("✅ No PostgreSQL/SQLAlchemy usage found in active codebase!")
    else:
        print("⚠️  PostgreSQL/SQLAlchemy usage found - needs cleanup!")
    
    print()
    
    # Find Supabase usage
    print("✅ Checking for Supabase SDK usage...")
    supabase_usage = find_supabase_usage(str(backend_dir))
    
    supabase_found = False
    for category, items in supabase_usage.items():
        if items:
            supabase_found = True
            print(f"✅ {category.upper()}:")
            for item in items:
                print(f"   {item}")
            print()
    
    if not supabase_found:
        print("❌ No Supabase SDK usage found!")
    else:
        print("✅ Supabase SDK usage confirmed!")
    
    print()
    
    # Validate requirements.txt
    print("📦 Checking requirements.txt...")
    requirements_path = backend_dir / "requirements.txt"
    
    if requirements_path.exists():
        req_validation = validate_requirements_txt(str(requirements_path))
        
        if req_validation['is_valid']:
            print("✅ requirements.txt is clean - no PostgreSQL dependencies!")
        else:
            print("❌ requirements.txt contains PostgreSQL dependencies:")
            for dep in req_validation['postgres_dependencies']:
                print(f"   - {dep}")
        
        if req_validation['supabase_dependencies']:
            print("✅ Supabase dependencies found:")
            for dep in req_validation['supabase_dependencies']:
                print(f"   + {dep}")
    else:
        print("❌ requirements.txt not found!")
    
    print()
    
    # Final validation
    print("🎯 FINAL VALIDATION:")
    if not postgres_found and supabase_found and req_validation.get('is_valid', False):
        print("✅ SUCCESS: Backend is using Supabase SDK exclusively!")
        print("✅ No PostgreSQL/SQLAlchemy dependencies found!")
        print("✅ Supabase SDK is properly integrated!")
        return 0
    else:
        print("❌ FAILURE: Backend still has PostgreSQL/SQLAlchemy usage!")
        print("❌ Cleanup required before proceeding!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
