#!/usr/bin/env python3
"""
Comprehensive script to disable all SQLAlchemy references in models
"""

import os
import re
from pathlib import Path

def disable_sqlalchemy_in_file(file_path: Path):
    """Disable SQLAlchemy references in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Add comment at the top if not already present
        if not content.startswith('"""') or 'disabled for Supabase-only' not in content:
            content = '"""\nThis model file is disabled for Supabase-only architecture.\nAll database operations go through Supabase SDK.\n"""\n\n' + content
        
        # Comment out SQLAlchemy imports
        sqlalchemy_patterns = [
            r'from sqlalchemy[^\n]*\n',
            r'import sqlalchemy[^\n]*\n',
            r'from sqlalchemy\.ext\.declarative import declarative_base\n',
            r'from sqlalchemy\.orm import[^\n]*\n',
        ]
        
        for pattern in sqlalchemy_patterns:
            content = re.sub(pattern, lambda m: '# ' + m.group(0), content)
        
        # Comment out declarative_base usage
        content = re.sub(r'Base = declarative_base\(\)', '# Base = declarative_base()  # Disabled for Supabase-only', content)
        
        # Comment out Column definitions
        content = re.sub(r'(\s+)(\w+)\s*=\s*Column\(', r'\1# \2 = Column(', content)
        
        # Comment out relationship definitions
        content = re.sub(r'(\s+)(\w+)\s*=\s*relationship\(', r'\1# \2 = relationship(', content)
        
        # Comment out table definitions
        content = re.sub(r'(\s+)__tablename__\s*=', r'\1# __tablename__ =', content)
        
        # Replace class definitions with simple data classes
        if 'class ' in content and 'Base' in content:
            # Find class definitions that inherit from Base
            class_pattern = r'class\s+(\w+)\(Base\):'
            matches = list(re.finditer(class_pattern, content))
            
            for match in reversed(matches):  # Process in reverse to maintain positions
                class_name = match.group(1)
                class_start = match.start()
                
                # Find the end of the class
                class_end = content.find('\nclass ', class_start)
                if class_end == -1:
                    class_end = len(content)
                
                # Replace with simple data class
                simple_class = f'''class {class_name}:
    """Simple data class for {class_name} - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
'''
                
                content = content[:class_start] + simple_class + content[class_end:]
        
        # Clean up multiple empty lines
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Disabled: {file_path}")
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function"""
    backend_dir = Path(__file__).parent
    models_dir = backend_dir / "src" / "models"
    
    if not models_dir.exists():
        print("Models directory not found")
        return
    
    disabled_files = []
    
    # Process all Python files in models directory
    for py_file in models_dir.rglob("*.py"):
        if py_file.name != "__init__.py":
            if disable_sqlalchemy_in_file(py_file):
                disabled_files.append(py_file)
    
    print(f"\nDisabled {len(disabled_files)} model files:")
    for file_path in disabled_files:
        print(f"  - {file_path.relative_to(backend_dir)}")

if __name__ == "__main__":
    main()
