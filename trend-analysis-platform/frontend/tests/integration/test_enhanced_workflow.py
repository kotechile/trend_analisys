"""
Integration test for enhanced topic workflow in frontend
Tests the complete frontend workflow integration
"""

import pytest
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'


class TestEnhancedWorkflowIntegration:
    """Integration tests for enhanced topic workflow"""
    
    @pytest.fixture
    def query_client(self):
        """Create React Query client for testing"""
        return new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
    
    @pytest.fixture
    def mock_axios(self):
        """Create axios mock adapter"""
        return new MockAdapter(axios)
    
    @pytest.fixture
    def theme(self):
        """Create MUI theme for testing"""
        return createTheme()
    
    def test_enhanced_workflow_complete_flow(self, query_client, mock_axios, theme):
        """Test complete enhanced workflow from start to finish"""
        # Mock API responses
        mock_axios.onPost('/api/enhanced-topics/decompose').reply(200, {
            success: True,
            message: "Topic decomposed into 6 enhanced subtopics",
            original_query: "fitness equipment",
            subtopics: [
                {
                    title: "best home gym equipment 2024",
                    search_volume_indicators: ["High search volume from autocomplete"],
                    autocomplete_suggestions: ["home gym setup", "gym equipment reviews"],
                    relevance_score: 0.9,
                    source: "hybrid"
                },
                {
                    title: "commercial fitness equipment",
                    search_volume_indicators: ["Found 12 related search suggestions"],
                    autocomplete_suggestions: ["gym equipment suppliers", "fitness equipment wholesale"],
                    relevance_score: 0.8,
                    source: "hybrid"
                }
            ],
            autocomplete_data: {
                query: "fitness equipment",
                suggestions: ["fitness equipment", "fitness equipment for home"],
                total_suggestions: 15,
                processing_time: 0.45
            },
            processing_time: 1.2,
            enhancement_methods: ["autocomplete", "llm"]
        })
        
        mock_axios.onPost('/api/enhanced-topics/compare-methods').reply(200, {
            success: True,
            original_query: "fitness equipment",
            comparison: {
                llm_only: {
                    subtopics: ["fitness equipment basics", "advanced fitness equipment"],
                    processing_time: 0.8,
                    method: "LLM Only"
                },
                autocomplete_only: {
                    subtopics: ["fitness equipment courses", "fitness equipment agency"],
                    processing_time: 0.6,
                    method: "Autocomplete Only"
                },
                hybrid: {
                    subtopics: ["best home gym equipment 2024", "commercial fitness equipment"],
                    processing_time: 1.1,
                    method: "Hybrid (LLM + Autocomplete)"
                }
            },
            recommendation: "Hybrid approach provides the best balance of intelligence and real-world relevance"
        })
        
        # Import and render the enhanced workflow component
        from components.workflow.EnhancedTopicDecompositionStep import EnhancedTopicDecompositionStep
        
        render(
            <QueryClientProvider client={query_client}>
                <BrowserRouter>
                    <ThemeProvider theme={theme}>
                        <EnhancedTopicDecompositionStep />
                    </ThemeProvider>
                </BrowserRouter>
            </QueryClientProvider>
        )
        
        # Test user interaction flow
        # 1. Enter search query
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        # 2. Click decompose button
        decompose_button = screen.getByText("Decompose Topic")
        fireEvent.click(decompose_button)
        
        # 3. Wait for results and verify display
        await waitFor(() => {
            expect(screen.getByText("best home gym equipment 2024")).toBeInTheDocument()
            expect(screen.getByText("commercial fitness equipment")).toBeInTheDocument()
        })
        
        # 4. Test method comparison
        compare_button = screen.getByText("Compare Methods")
        fireEvent.click(compare_button)
        
        # 5. Wait for comparison results
        await waitFor(() => {
            expect(screen.getByText("LLM Only")).toBeInTheDocument()
            expect(screen.getByText("Autocomplete Only")).toBeInTheDocument()
            expect(screen.getByText("Hybrid (LLM + Autocomplete)")).toBeInTheDocument()
        })
        
        # 6. Verify recommendation display
        await waitFor(() => {
            expect(screen.getByText(/Hybrid approach provides the best balance/)).toBeInTheDocument()
        })
    
    def test_enhanced_workflow_error_handling(self, query_client, mock_axios, theme):
        """Test error handling in enhanced workflow"""
        # Mock API error
        mock_axios.onPost('/api/enhanced-topics/decompose').reply(500, {
            success: False,
            error: "INTERNAL_ERROR",
            message: "Internal server error"
        })
        
        from components.workflow.EnhancedTopicDecompositionStep import EnhancedTopicDecompositionStep
        
        render(
            <QueryClientProvider client={query_client}>
                <BrowserRouter>
                    <ThemeProvider theme={theme}>
                        <EnhancedTopicDecompositionStep />
                    </ThemeProvider>
                </BrowserRouter>
            </QueryClientProvider>
        )
        
        # Enter query and attempt decomposition
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        decompose_button = screen.getByText("Decompose Topic")
        fireEvent.click(decompose_button)
        
        # Verify error handling
        await waitFor(() => {
            expect(screen.getByText(/Internal server error/)).toBeInTheDocument()
        })
    
    def test_enhanced_workflow_loading_states(self, query_client, mock_axios, theme):
        """Test loading states during API calls"""
        # Mock delayed response
        mock_axios.onPost('/api/enhanced-topics/decompose').reply(200, {
            success: True,
            message: "Topic decomposed successfully",
            original_query: "fitness equipment",
            subtopics: [],
            autocomplete_data: {
                query: "fitness equipment",
                suggestions: [],
                total_suggestions: 0,
                processing_time: 0.5
            },
            processing_time: 1.0,
            enhancement_methods: ["autocomplete", "llm"]
        })
        
        from components.workflow.EnhancedTopicDecompositionStep import EnhancedTopicDecompositionStep
        
        render(
            <QueryClientProvider client={query_client}>
                <BrowserRouter>
                    <ThemeProvider theme={theme}>
                        <EnhancedTopicDecompositionStep />
                    </ThemeProvider>
                </BrowserRouter>
            </QueryClientProvider>
        )
        
        # Enter query and click decompose
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        decompose_button = screen.getByText("Decompose Topic")
        fireEvent.click(decompose_button)
        
        # Verify loading state
        expect(screen.getByText(/Loading/)).toBeInTheDocument()
        expect(decompose_button).toBeDisabled()
    
    def test_enhanced_workflow_autocomplete_suggestions(self, query_client, mock_axios, theme):
        """Test autocomplete suggestions display"""
        # Mock autocomplete API
        mock_axios.onGet('/api/enhanced-topics/autocomplete/fitness equipment').reply(200, {
            success: True,
            query: "fitness equipment",
            suggestions: [
                "fitness equipment",
                "fitness equipment for home",
                "fitness equipment store"
            ],
            total_suggestions: 3,
            processing_time: 0.3
        })
        
        from components.workflow.EnhancedTopicDecompositionStep import EnhancedTopicDecompositionStep
        
        render(
            <QueryClientProvider client={query_client}>
                <BrowserRouter>
                    <ThemeProvider theme={theme}>
                        <EnhancedTopicDecompositionStep />
                    </ThemeProvider>
                </BrowserRouter>
            </QueryClientProvider>
        )
        
        # Type in search input to trigger autocomplete
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        # Wait for autocomplete suggestions
        await waitFor(() => {
            expect(screen.getByText("fitness equipment for home")).toBeInTheDocument()
            expect(screen.getByText("fitness equipment store")).toBeInTheDocument()
        })
    
    def test_enhanced_workflow_relevance_scoring_display(self, query_client, mock_axios, theme):
        """Test relevance scoring display"""
        mock_axios.onPost('/api/enhanced-topics/decompose').reply(200, {
            success: True,
            message: "Topic decomposed successfully",
            original_query: "fitness equipment",
            subtopics: [
                {
                    title: "best home gym equipment 2024",
                    search_volume_indicators: ["High search volume"],
                    autocomplete_suggestions: ["home gym setup"],
                    relevance_score: 0.9,
                    source: "hybrid"
                },
                {
                    title: "fitness equipment maintenance",
                    search_volume_indicators: ["Medium search volume"],
                    autocomplete_suggestions: ["equipment care"],
                    relevance_score: 0.6,
                    source: "hybrid"
                }
            ],
            autocomplete_data: {
                query: "fitness equipment",
                suggestions: ["fitness equipment"],
                total_suggestions: 1,
                processing_time: 0.3
            },
            processing_time: 1.0,
            enhancement_methods: ["autocomplete", "llm"]
        })
        
        from components.workflow.EnhancedTopicDecompositionStep import EnhancedTopicDecompositionStep
        
        render(
            <QueryClientProvider client={query_client}>
                <BrowserRouter>
                    <ThemeProvider theme={theme}>
                        <EnhancedTopicDecompositionStep />
                    </ThemeProvider>
                </BrowserRouter>
            </QueryClientProvider>
        )
        
        # Enter query and decompose
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        decompose_button = screen.getByText("Decompose Topic")
        fireEvent.click(decompose_button)
        
        # Wait for results and verify relevance scoring display
        await waitFor(() => {
            expect(screen.getByText("90%")).toBeInTheDocument()  # 0.9 relevance score
            expect(screen.getByText("60%")).toBeInTheDocument()  # 0.6 relevance score
        })
    
    def test_enhanced_workflow_method_comparison_ui(self, query_client, mock_axios, theme):
        """Test method comparison UI display"""
        mock_axios.onPost('/api/enhanced-topics/compare-methods').reply(200, {
            success: True,
            original_query: "fitness equipment",
            comparison: {
                llm_only: {
                    subtopics: ["fitness equipment basics"],
                    processing_time: 0.8,
                    method: "LLM Only"
                },
                autocomplete_only: {
                    subtopics: ["fitness equipment courses"],
                    processing_time: 0.6,
                    method: "Autocomplete Only"
                },
                hybrid: {
                    subtopics: ["best home gym equipment 2024"],
                    processing_time: 1.1,
                    method: "Hybrid (LLM + Autocomplete)"
                }
            },
            recommendation: "Hybrid approach recommended"
        })
        
        from components.workflow.EnhancedTopicDecompositionStep import EnhancedTopicDecompositionStep
        
        render(
            <QueryClientProvider client={query_client}>
                <BrowserRouter>
                    <ThemeProvider theme={theme}>
                        <EnhancedTopicDecompositionStep />
                    </ThemeProvider>
                </BrowserRouter>
            </QueryClientProvider>
        )
        
        # Enter query and compare methods
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        compare_button = screen.getByText("Compare Methods")
        fireEvent.click(compare_button)
        
        # Wait for comparison results
        await waitFor(() => {
            expect(screen.getByText("LLM Only")).toBeInTheDocument()
            expect(screen.getByText("Autocomplete Only")).toBeInTheDocument()
            expect(screen.getByText("Hybrid (LLM + Autocomplete)")).toBeInTheDocument()
            expect(screen.getByText("Hybrid approach recommended")).toBeInTheDocument()
        })
    
    def test_enhanced_workflow_performance_metrics(self, query_client, mock_axios, theme):
        """Test performance metrics display"""
        mock_axios.onPost('/api/enhanced-topics/decompose').reply(200, {
            success: True,
            message: "Topic decomposed successfully",
            original_query: "fitness equipment",
            subtopics: [],
            autocomplete_data: {
                query: "fitness equipment",
                suggestions: ["fitness equipment"],
                total_suggestions: 1,
                processing_time: 0.45
            },
            processing_time: 1.2,
            enhancement_methods: ["autocomplete", "llm"]
        })
        
        from components.workflow.EnhancedTopicDecompositionStep import EnhancedTopicDecompositionStep
        
        render(
            <QueryClientProvider client={query_client}>
                <BrowserRouter>
                    <ThemeProvider theme={theme}>
                        <EnhancedTopicDecompositionStep />
                    </ThemeProvider>
                </BrowserRouter>
            </QueryClientProvider>
        )
        
        # Enter query and decompose
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        decompose_button = screen.getByText("Decompose Topic")
        fireEvent.click(decompose_button)
        
        # Wait for results and verify performance metrics
        await waitFor(() => {
            expect(screen.getByText(/1.2s/)).toBeInTheDocument()  # Total processing time
            expect(screen.getByText(/0.45s/)).toBeInTheDocument()  # Autocomplete time
        })

