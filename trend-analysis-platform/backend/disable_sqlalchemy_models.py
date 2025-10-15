#!/usr/bin/env python3
"""
Script to disable SQLAlchemy models for Supabase-only architecture
"""

import os
import re
from pathlib import Path

def disable_model_file(file_path: Path):
    """Disable SQLAlchemy model file by commenting out problematic code"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Add comment at the top
        if not content.startswith('"""'):
            content = '"""\nThis model file is disabled for Supabase-only architecture.\nAll database operations go through Supabase SDK.\n"""\n\n' + content
        
        # Comment out SQLAlchemy imports
        sqlalchemy_imports = [
            r'from sqlalchemy[^\n]*\n',
            r'import sqlalchemy[^\n]*\n',
        ]
        
        for pattern in sqlalchemy_imports:
            content = re.sub(pattern, lambda m: '# ' + m.group(0), content)
        
        # Comment out Column definitions
        content = re.sub(r'(\s+)(\w+)\s*=\s*Column\(', r'\1# \2 = Column(', content)
        
        # Comment out relationship definitions
        content = re.sub(r'(\s+)(\w+)\s*=\s*relationship\(', r'\1# \2 = relationship(', content)
        
        # Comment out table definitions
        content = re.sub(r'(\s+)__tablename__\s*=', r'\1# __tablename__ =', content)
        
        # Add a simple class definition that doesn't use SQLAlchemy
        if 'class ' in content and 'Base' in content:
            # Find the class definition and replace it with a simple one
            class_match = re.search(r'class\s+(\w+)\(Base\):', content)
            if class_match:
                class_name = class_match.group(1)
                # Replace the entire class with a simple one
                class_start = class_match.start()
                class_end = content.find('\nclass ', class_start)
                if class_end == -1:
                    class_end = len(content)
                
                simple_class = f'''class {class_name}:
    """Simple data class for {class_name} - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
'''
                
                content = content[:class_start] + simple_class + content[class_end:]
        
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
            if disable_model_file(py_file):
                disabled_files.append(py_file)
    
    print(f"\nDisabled {len(disabled_files)} model files:")
    for file_path in disabled_files:
        print(f"  - {file_path.relative_to(backend_dir)}")

if __name__ == "__main__":
    main()
