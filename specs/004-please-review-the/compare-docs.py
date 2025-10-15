#!/usr/bin/env python3
"""
Documentation Comparison Tool
Compares migration guide with current project documentation to identify discrepancies.
"""

import os
import re
import hashlib
from pathlib import Path
from typing import Dict, List, Tuple, Any
import json

class DocumentationComparator:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.migration_guide_path = self.project_root / "docs" / "MIGRATION_GUIDE.md"
        self.findings = []
        
    def analyze_migration_guide(self) -> Dict[str, Any]:
        """Analyze the migration guide for key information."""
        if not self.migration_guide_path.exists():
            return {"error": "Migration guide not found"}
            
        with open(self.migration_guide_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        analysis = {
            "file_size": len(content),
            "line_count": len(content.splitlines()),
            "timeline_mentions": self._find_timeline_mentions(content),
            "structure_references": self._find_structure_references(content),
            "legacy_references": self._find_legacy_references(content),
            "technology_mentions": self._find_technology_mentions(content),
            "testing_mentions": self._find_testing_mentions(content),
            "api_mentions": self._find_api_mentions(content),
            "database_mentions": self._find_database_mentions(content),
            "security_mentions": self._find_security_mentions(content),
            "deployment_mentions": self._find_deployment_mentions(content)
        }
        
        return analysis
    
    def _find_timeline_mentions(self, content: str) -> List[str]:
        """Find timeline references in the content."""
        patterns = [
            r'(\d+)\s*week',
            r'(\d+)\s*month',
            r'Phase\s+(\d+)',
            r'Milestone\s+(\d+)',
            r'(\d+)\s*day'
        ]
        
        mentions = []
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            mentions.extend(matches)
            
        return list(set(mentions))
    
    def _find_structure_references(self, content: str) -> List[str]:
        """Find project structure references."""
        patterns = [
            r'backend/app/',
            r'backend/src/',
            r'frontend/src/',
            r'frontend/app/',
            r'shared/',
            r'docs/',
            r'specs/'
        ]
        
        references = []
        for pattern in patterns:
            matches = re.findall(pattern, content)
            references.extend(matches)
            
        return list(set(references))
    
    def _find_legacy_references(self, content: str) -> List[str]:
        """Find legacy file references."""
        patterns = [
            r'legacy-reference/python-code/',
            r'legacy-reference/',
            r'python-code/',
            r'\.py\b'
        ]
        
        references = []
        for pattern in patterns:
            matches = re.findall(pattern, content)
            references.extend(matches)
            
        return list(set(references))
    
    def _find_technology_mentions(self, content: str) -> List[str]:
        """Find technology stack mentions."""
        technologies = [
            'React', 'FastAPI', 'Python', 'TypeScript', 'JavaScript',
            'Supabase', 'PostgreSQL', 'Docker', 'Vercel', 'Render',
            'Fly.io', 'Material-UI', 'Shadcn', 'Pydantic', 'Alembic',
            'JWT', 'OpenAPI', 'Swagger', 'GitHub Actions', 'CI/CD'
        ]
        
        mentions = []
        for tech in technologies:
            if tech.lower() in content.lower():
                mentions.append(tech)
                
        return mentions
    
    def _find_testing_mentions(self, content: str) -> List[str]:
        """Find testing-related mentions."""
        patterns = [
            r'TDD',
            r'test-driven',
            r'pytest',
            r'unit test',
            r'integration test',
            r'contract test',
            r'coverage',
            r'Playwright',
            r'Cypress'
        ]
        
        mentions = []
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            mentions.extend(matches)
            
        return list(set(mentions))
    
    def _find_api_mentions(self, content: str) -> List[str]:
        """Find API-related mentions."""
        patterns = [
            r'API',
            r'endpoint',
            r'REST',
            r'GraphQL',
            r'OpenAPI',
            r'Swagger',
            r'contract',
            r'POST',
            r'GET',
            r'PUT',
            r'DELETE'
        ]
        
        mentions = []
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            mentions.extend(matches)
            
        return list(set(mentions))
    
    def _find_database_mentions(self, content: str) -> List[str]:
        """Find database-related mentions."""
        patterns = [
            r'database',
            r'schema',
            r'model',
            r'RLS',
            r'Row Level Security',
            r'migration',
            r'Alembic',
            r'PostgreSQL',
            r'Supabase'
        ]
        
        mentions = []
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            mentions.extend(matches)
            
        return list(set(mentions))
    
    def _find_security_mentions(self, content: str) -> List[str]:
        """Find security-related mentions."""
        patterns = [
            r'security',
            r'authentication',
            r'authorization',
            r'JWT',
            r'encryption',
            r'GDPR',
            r'CCPA',
            r'RBAC',
            r'audit'
        ]
        
        mentions = []
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            mentions.extend(matches)
            
        return list(set(mentions))
    
    def _find_deployment_mentions(self, content: str) -> List[str]:
        """Find deployment-related mentions."""
        patterns = [
            r'deployment',
            r'CI/CD',
            r'GitHub Actions',
            r'Docker',
            r'Vercel',
            r'Render',
            r'Fly.io',
            r'staging',
            r'production',
            r'pipeline'
        ]
        
        mentions = []
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            mentions.extend(matches)
            
        return list(set(mentions))
    
    def compare_with_current_state(self) -> Dict[str, Any]:
        """Compare migration guide with current project state."""
        migration_analysis = self.analyze_migration_guide()
        
        if "error" in migration_analysis:
            return migration_analysis
            
        # Check current project structure
        current_structure = self._analyze_current_structure()
        
        # Check current documentation
        current_docs = self._analyze_current_documentation()
        
        # Identify discrepancies
        discrepancies = self._identify_discrepancies(migration_analysis, current_structure, current_docs)
        
        return {
            "migration_guide": migration_analysis,
            "current_structure": current_structure,
            "current_documentation": current_docs,
            "discrepancies": discrepancies
        }
    
    def _analyze_current_structure(self) -> Dict[str, Any]:
        """Analyze current project structure."""
        structure = {
            "backend_structure": "src/",  # Current project uses backend/src/
            "frontend_structure": "src/",
            "docs_structure": "docs/",
            "specs_structure": "specs/",
            "legacy_references_exist": False
        }
        
        # Check if legacy-reference directory exists
        legacy_path = self.project_root / "legacy-reference"
        structure["legacy_references_exist"] = legacy_path.exists()
        
        return structure
    
    def _analyze_current_documentation(self) -> Dict[str, Any]:
        """Analyze current project documentation."""
        docs = {
            "implementation_plan": "docs/IMPLEMENTATION_PLAN.md",
            "development_guide": "docs/DEVELOPMENT_GUIDE.md",
            "baseline_specification": "docs/BASELINE_SPECIFICATION.md",
            "quick_reference": "docs/QUICK_REFERENCE.md",
            "constitution": ".specify/memory/constitution.md"
        }
        
        # Check which docs exist
        existing_docs = {}
        for name, path in docs.items():
            full_path = self.project_root / path
            existing_docs[name] = {
                "exists": full_path.exists(),
                "path": str(full_path)
            }
            
        return existing_docs
    
    def _identify_discrepancies(self, migration_analysis: Dict, current_structure: Dict, current_docs: Dict) -> List[Dict[str, Any]]:
        """Identify discrepancies between migration guide and current state."""
        discrepancies = []
        
        # Timeline discrepancies
        timeline_mentions = migration_analysis.get("timeline_mentions", [])
        if any("8" in str(mention) for mention in timeline_mentions):
            discrepancies.append({
                "type": "timeline_misalignment",
                "severity": "critical",
                "description": "Migration guide mentions 8-week timeline but current implementation plan shows 10-13 weeks",
                "location": "Timeline sections in migration guide",
                "current_state": "10-13 week timeline in implementation plan",
                "migration_guide_state": "8-week timeline"
            })
        
        # Structure discrepancies
        structure_refs = migration_analysis.get("structure_references", [])
        if "backend/app/" in structure_refs:
            discrepancies.append({
                "type": "structure_difference",
                "severity": "high",
                "description": "Migration guide references backend/app/ but current project uses backend/src/",
                "location": "Project structure sections in migration guide",
                "current_state": "backend/src/",
                "migration_guide_state": "backend/app/"
            })
        
        # Legacy reference discrepancies
        legacy_refs = migration_analysis.get("legacy_references", [])
        if legacy_refs and not current_structure.get("legacy_references_exist", False):
            discrepancies.append({
                "type": "missing_legacy_references",
                "severity": "medium",
                "description": "Migration guide references legacy-reference/python-code/ directory that doesn't exist",
                "location": "Legacy reference sections in migration guide",
                "current_state": "Directory does not exist",
                "migration_guide_state": "References to legacy-reference/python-code/"
            })
        
        return discrepancies
    
    def generate_report(self) -> str:
        """Generate a comprehensive comparison report."""
        comparison = self.compare_with_current_state()
        
        if "error" in comparison:
            return f"Error: {comparison['error']}"
        
        report = f"""
# Migration Guide Comparison Report

**Generated**: {self._get_timestamp()}
**Migration Guide**: {self.migration_guide_path}
**Project Root**: {self.project_root}

## Summary
- **File Size**: {comparison['migration_guide']['file_size']} bytes
- **Line Count**: {comparison['migration_guide']['line_count']} lines
- **Discrepancies Found**: {len(comparison['discrepancies'])}

## Critical Issues Found
"""
        
        critical_issues = [d for d in comparison['discrepancies'] if d['severity'] == 'critical']
        for issue in critical_issues:
            report += f"\n### {issue['type'].replace('_', ' ').title()}\n"
            report += f"- **Description**: {issue['description']}\n"
            report += f"- **Location**: {issue['location']}\n"
            report += f"- **Current State**: {issue['current_state']}\n"
            report += f"- **Migration Guide State**: {issue['migration_guide_state']}\n"
        
        report += "\n## High Priority Issues Found\n"
        high_issues = [d for d in comparison['discrepancies'] if d['severity'] == 'high']
        for issue in high_issues:
            report += f"\n### {issue['type'].replace('_', ' ').title()}\n"
            report += f"- **Description**: {issue['description']}\n"
            report += f"- **Location**: {issue['location']}\n"
            report += f"- **Current State**: {issue['current_state']}\n"
            report += f"- **Migration Guide State**: {issue['migration_guide_state']}\n"
        
        report += "\n## Technology Stack Analysis\n"
        tech_mentions = comparison['migration_guide'].get('technology_mentions', [])
        report += f"- **Technologies Mentioned**: {', '.join(tech_mentions)}\n"
        
        report += "\n## Recommendations\n"
        report += "1. Update timeline references to match current implementation plan\n"
        report += "2. Correct project structure references throughout\n"
        report += "3. Verify and update legacy file references\n"
        report += "4. Integrate current technology stack details\n"
        report += "5. Align testing strategy with current TDD approach\n"
        
        return report
    
    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def main():
    """Main function to run the comparison."""
    project_root = "/Users/jorgefernandezilufi/Documents/_article_research/Trend_analisys-spec-kit"
    comparator = DocumentationComparator(project_root)
    
    report = comparator.generate_report()
    
    # Save report
    report_path = Path(project_root) / "specs" / "004-please-review-the" / "comparison-report.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("Comparison report generated:", report_path)
    print("\n" + "="*50)
    print(report)

if __name__ == "__main__":
    main()
