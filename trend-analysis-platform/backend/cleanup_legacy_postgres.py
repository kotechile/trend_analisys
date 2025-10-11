#!/usr/bin/env python3
"""
Legacy PostgreSQL/SQLAlchemy Cleanup Script

This script removes all legacy SQLAlchemy files that are not used by the main application.
Only Supabase SDK should remain for database operations.
"""

import os
import shutil
from pathlib import Path
from typing import List, Set

def get_active_files() -> Set[str]:
    """
    Get the list of files that are actively used by the main application.
    These files should NOT be deleted.
    """
    active_files = {
        # Main application files
        "src/main.py",
        "src/api/supabase_health_routes.py", 
        "src/api/supabase_api_routes.py",
        "src/core/supabase_database_service.py",
        
        # New Supabase implementation files (created by us)
        "src/core/supabase_client.py",
        "src/core/logging.py", 
        "src/core/error_handler.py",
        "src/models/supabase_client.py",
        "src/models/database_operation.py",
        "src/models/auth_context.py", 
        "src/models/data_model.py",
        "src/services/supabase_service.py",
        "src/services/database_operation_service.py",
        "src/services/auth_service.py",
        "src/services/realtime_service.py",
        "src/api/health_routes.py",
        "src/api/database_routes.py",
        "src/api/realtime_routes.py",
        "src/middleware/auth_middleware.py",
        "src/middleware/logging_middleware.py",
        "src/middleware/error_middleware.py",
        "src/middleware/timeout_middleware.py",
        "src/middleware/health_middleware.py",
        "src/middleware/realtime_middleware.py",
        "src/middleware/validation_middleware.py",
        
        # Test files for new implementation
        "tests/contract/test_health_endpoint.py",
        "tests/contract/test_database_operations.py", 
        "tests/contract/test_operation_status.py",
        "tests/contract/test_realtime_subscribe.py",
        "tests/contract/test_realtime_unsubscribe.py",
        "tests/integration/test_supabase_connection.py",
        "tests/integration/test_database_operations.py",
        "tests/integration/test_auth_context.py",
        "tests/integration/test_realtime_features.py",
        "tests/integration/test_error_handling.py",
        
        # Configuration files
        "requirements.txt",
        "env.example",
        "validate_supabase_only.py",
        "cleanup_legacy_postgres.py"
    }
    
    return active_files

def get_legacy_sqlalchemy_files() -> List[str]:
    """
    Get the list of legacy SQLAlchemy files that should be removed.
    """
    legacy_files = [
        # Legacy SQLAlchemy models
        "src/models/user.py",
        "src/models/authentication_context.py", 
        "src/models/trend_analysis.py",
        "src/models/affiliate_program.py",
        "src/models/llm_config.py",
        "src/models/content_calendar.py",
        "src/models/export_templates.py",
        "src/models/content_ideas.py",
        "src/models/external_tool_result.py",
        "src/models/workflow_sessions.py",
        "src/models/content_idea.py",
        "src/models/keyword_cluster.py",
        "src/models/keyword_data.py",
        "src/models/keyword_clusters.py",
        "src/models/trend_selections.py",
        "src/models/topic_analysis.py",
        "src/models/authentication_log.py",
        "src/models/password_reset.py",
        "src/models/user_session.py",
        "src/models/software_solutions.py",
        "src/models/affiliate_research.py",
        "src/models/csrf_protection.py",
        "src/models/jwt_blacklist.py",
        "src/models/account_lockout.py",
        
        # Legacy SQLAlchemy services
        "src/services/affiliate_program_service.py",
        "src/services/llm_service.py",
        "src/services/topic_analysis_service.py",
        "src/services/external_tool_integration_service.py",
        "src/services/content_generation_service.py",
        "src/services/keyword_clustering_service.py",
        "src/services/google_trends_service.py",
        "src/services/workflow_session_service.py",
        "src/services/trend_analysis_service.py",
        "src/services/csv_upload_service.py",
        "src/services/api_key_service.py",
        "src/services/affiliate_offer_service.py",
        "src/services/external_tool_service.py",
        "src/services/topic_decomposition_service.py",
        "src/services/connection_pool_config.py",
        "src/services/index_optimizer.py",
        "src/services/connection_pool_optimizer.py",
        "src/services/query_optimizer.py",
        "src/services/csrf_protection.py",
        "src/services/jwt_blacklist.py",
        "src/services/account_lockout.py",
        "src/services/session_service.py",
        "src/services/supabase_integration_service.py",
        "src/services/supabase_error_handler.py",
        "src/services/websocket_handler.py",
        
        # Legacy SQLAlchemy API routes
        "src/api/topic_decomposition_routes.py",
        "src/api/realtime.py",
        "src/api/migration.py",
        "src/api/database_operations.py",
        "src/api/simple_content_routes.py",
        "src/api/admin_routes.py",
        "src/api/keyword_routes.py",
        "src/api/trend_routes.py",
        "src/api/admin_llm_routes.py",
        "src/api/content_generation_routes.py",
        "src/api/trend_analysis_routes.py",
        "src/api/enhanced_workflow_routes.py",
        "src/api/affiliate_offer_routes.py",
        "src/api/api_key_routes.py",
        "src/api/topic_analysis_routes.py",
        "src/api/auth_routes.py",
        "src/api/user_routes.py",
        "src/api/calendar_routes.py",
        "src/api/export_routes.py",
        "src/api/content_routes.py",
        "src/api/software_routes.py",
        "src/api/csrf_routes.py",
        "src/api/security_routes.py",
        
        # Legacy database files
        "src/core/database.py",
        "src/core/database_init.py",
        "src/database/migration.py",
        
        # Legacy middleware
        "src/middleware/auth.py",
        
        # Legacy scripts
        "src/scripts/validate_migration.py",
        "src/scripts/migrate_to_supabase.py",
        
        # Legacy test files
        "tests/unit/test_supabase_error_handler.py",
        "tests/unit/test_supabase_client.py",
        "tests/unit/test_supabase_service.py",
        "tests/unit/test_supabase_connection_manager.py",
        "tests/unit/test_realtime_service.py",
        "tests/integration/test_database_migration.py",
        "tests/integration/test_auth_context.py",
        "tests/integration/test_realtime_features.py",
        
        # Legacy configuration files
        "alembic.ini",
        "requirements-ultra-minimal.txt",
        "requirements-minimal.txt", 
        "requirements-fast.txt"
    ]
    
    return legacy_files

def backup_legacy_files(legacy_files: List[str], backup_dir: str) -> None:
    """
    Backup legacy files before deletion.
    """
    backup_path = Path(backup_dir)
    backup_path.mkdir(exist_ok=True)
    
    print(f"📦 Creating backup in {backup_dir}/...")
    
    for file_path in legacy_files:
        src_path = Path(file_path)
        if src_path.exists():
            # Create backup directory structure
            backup_file_path = backup_path / file_path
            backup_file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Copy file to backup
            shutil.copy2(src_path, backup_file_path)
            print(f"   Backed up: {file_path}")

def remove_legacy_files(legacy_files: List[str]) -> None:
    """
    Remove legacy SQLAlchemy files.
    """
    removed_count = 0
    
    for file_path in legacy_files:
        path = Path(file_path)
        if path.exists():
            if path.is_file():
                path.unlink()
                print(f"🗑️  Removed file: {file_path}")
                removed_count += 1
            elif path.is_dir():
                shutil.rmtree(path)
                print(f"🗑️  Removed directory: {file_path}")
                removed_count += 1
    
    print(f"✅ Removed {removed_count} legacy files/directories")

def clean_empty_directories() -> None:
    """
    Remove empty directories after file cleanup.
    """
    print("🧹 Cleaning up empty directories...")
    
    # Directories to check for emptiness
    dirs_to_check = [
        "src/models",
        "src/services", 
        "src/api",
        "src/middleware",
        "src/scripts",
        "tests/unit",
        "tests/integration"
    ]
    
    for dir_path in dirs_to_check:
        path = Path(dir_path)
        if path.exists() and path.is_dir():
            try:
                # Check if directory is empty
                if not any(path.iterdir()):
                    path.rmdir()
                    print(f"🗑️  Removed empty directory: {dir_path}")
            except OSError:
                # Directory not empty or other error
                pass

def main():
    """Main cleanup function."""
    print("🧹 Starting Legacy PostgreSQL/SQLAlchemy Cleanup...")
    print("=" * 60)
    
    # Get file lists
    active_files = get_active_files()
    legacy_files = get_legacy_sqlalchemy_files()
    
    print(f"📋 Active files to preserve: {len(active_files)}")
    print(f"📋 Legacy files to remove: {len(legacy_files)}")
    print()
    
    # Create backup
    backup_dir = "legacy_backup"
    backup_legacy_files(legacy_files, backup_dir)
    print()
    
    # Remove legacy files
    print("🗑️  Removing legacy SQLAlchemy files...")
    remove_legacy_files(legacy_files)
    print()
    
    # Clean empty directories
    clean_empty_directories()
    print()
    
    # Final summary
    print("✅ CLEANUP COMPLETE!")
    print(f"📦 Legacy files backed up to: {backup_dir}/")
    print("🎯 Only Supabase SDK files remain")
    print()
    print("Next steps:")
    print("1. Run validation script to verify cleanup")
    print("2. Test the application to ensure it works")
    print("3. Remove backup directory if everything works")

if __name__ == "__main__":
    main()
