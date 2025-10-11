"""
Integration test for autocomplete suggestions in frontend
Tests the autocomplete functionality integration
"""

import pytest
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'


class TestAutocompleteSuggestionsIntegration:
    """Integration tests for autocomplete suggestions"""
    
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
    
    def test_autocomplete_suggestions_basic_functionality(self, query_client, mock_axios, theme):
        """Test basic autocomplete suggestions functionality"""
        # Mock autocomplete API response
        mock_axios.onGet('/api/enhanced-topics/autocomplete/fitness equipment').reply(200, {
            success: True,
            query: "fitness equipment",
            suggestions: [
                "fitness equipment",
                "fitness equipment for home",
                "fitness equipment store",
                "fitness equipment near me"
            ],
            total_suggestions: 4,
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
        
        # Type in search input
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        # Wait for autocomplete suggestions to appear
        await waitFor(() => {
            expect(screen.getByText("fitness equipment for home")).toBeInTheDocument()
            expect(screen.getByText("fitness equipment store")).toBeInTheDocument()
            expect(screen.getByText("fitness equipment near me")).toBeInTheDocument()
        })
    
    def test_autocomplete_suggestions_click_selection(self, query_client, mock_axios, theme):
        """Test clicking on autocomplete suggestions"""
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
        
        # Type in search input
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        # Wait for suggestions and click on one
        await waitFor(() => {
            const suggestion = screen.getByText("fitness equipment for home")
            fireEvent.click(suggestion)
        })
        
        # Verify input value was updated
        expect(search_input.value).toBe("fitness equipment for home")
    
    def test_autocomplete_suggestions_keyboard_navigation(self, query_client, mock_axios, theme):
        """Test keyboard navigation of autocomplete suggestions"""
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
        
        # Type in search input
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        # Wait for suggestions
        await waitFor(() => {
            expect(screen.getByText("fitness equipment for home")).toBeInTheDocument()
        })
        
        # Test keyboard navigation
        fireEvent.keyDown(search_input, { key: 'ArrowDown' })
        fireEvent.keyDown(search_input, { key: 'ArrowDown' })
        fireEvent.keyDown(search_input, { key: 'Enter' })
        
        # Verify selection
        expect(search_input.value).toBe("fitness equipment store")
    
    def test_autocomplete_suggestions_loading_state(self, query_client, mock_axios, theme):
        """Test loading state during autocomplete requests"""
        // Mock delayed response
        mock_axios.onGet('/api/enhanced-topics/autocomplete/fitness equipment').reply(200, {
            success: True,
            query: "fitness equipment",
            suggestions: ["fitness equipment"],
            total_suggestions: 1,
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
        
        // Type in search input
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        // Verify loading state
        expect(screen.getByText(/Loading suggestions/)).toBeInTheDocument()
    
    def test_autocomplete_suggestions_error_handling(self, query_client, mock_axios, theme):
        """Test error handling for autocomplete requests"""
        // Mock API error
        mock_axios.onGet('/api/enhanced-topics/autocomplete/fitness equipment').reply(500, {
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
        
        // Type in search input
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/Failed to load suggestions/)).toBeInTheDocument()
        })
    
    def test_autocomplete_suggestions_empty_results(self, query_client, mock_axios, theme):
        """Test handling of empty autocomplete results"""
        mock_axios.onGet('/api/enhanced-topics/autocomplete/very obscure query').reply(200, {
            success: True,
            query: "very obscure query",
            suggestions: [],
            total_suggestions: 0,
            processing_time: 0.1
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
        
        // Type in search input
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "very obscure query" } })
        
        // Wait for empty state message
        await waitFor(() => {
            expect(screen.getByText(/No suggestions found/)).toBeInTheDocument()
        })
    
    def test_autocomplete_suggestions_debouncing(self, query_client, mock_axios, theme):
        """Test debouncing of autocomplete requests"""
        mock_axios.onGet('/api/enhanced-topics/autocomplete/fitness').reply(200, {
            success: True,
            query: "fitness",
            suggestions: ["fitness equipment"],
            total_suggestions: 1,
            processing_time: 0.1
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
        
        // Type rapidly to test debouncing
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "f" } })
        fireEvent.change(search_input, { target: { value: "fi" } })
        fireEvent.change(search_input, { target: { value: "fit" } })
        fireEvent.change(search_input, { target: { value: "fitness" } })
        
        // Wait for debounced request
        await waitFor(() => {
            expect(screen.getByText("fitness equipment")).toBeInTheDocument()
        })
        
        // Verify only one request was made
        expect(mock_axios.history.get.length).toBe(1)
    
    def test_autocomplete_suggestions_performance(self, query_client, mock_axios, theme):
        """Test performance requirements for autocomplete"""
        mock_axios.onGet('/api/enhanced-topics/autocomplete/fitness equipment').reply(200, {
            success: True,
            query: "fitness equipment",
            suggestions: ["fitness equipment", "fitness equipment for home"],
            total_suggestions: 2,
            processing_time: 0.2  // Fast response
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
        
        // Type in search input
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        // Wait for suggestions
        await waitFor(() => {
            expect(screen.getByText("fitness equipment for home")).toBeInTheDocument()
        })
        
        // Verify performance metrics are displayed
        expect(screen.getByText(/0.2s/)).toBeInTheDocument()
    
    def test_autocomplete_suggestions_accessibility(self, query_client, mock_axios, theme):
        """Test accessibility features of autocomplete suggestions"""
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
        
        // Type in search input
        search_input = screen.getByPlaceholderText("Enter your topic for enhanced research...")
        fireEvent.change(search_input, { target: { value: "fitness equipment" } })
        
        // Wait for suggestions
        await waitFor(() => {
            expect(screen.getByText("fitness equipment for home")).toBeInTheDocument()
        })
        
        // Verify accessibility attributes
        const suggestions_list = screen.getByRole('listbox')
        expect(suggestions_list).toBeInTheDocument()
        expect(suggestions_list).toHaveAttribute('aria-label', 'Autocomplete suggestions')
        
        const suggestions = screen.getAllByRole('option')
        expect(suggestions).toHaveLength(3)
        suggestions.forEach(suggestion => {
            expect(suggestion).toHaveAttribute('tabindex', '0')
        })

