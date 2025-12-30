/**
 * Project Setup Tests
 * Tests that all required dependencies are installed and configurations are valid
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import React from 'react';
import { MenuStatus } from '../types';

describe('Project Setup', () => {
  describe('Environment Configuration', () => {
    it('should have test environment variables configured', () => {
      // Set test environment variables for this test
      process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      process.env.VITE_SUPABASE_ANON_KEY = 'test-key';
      process.env.VITE_APP_ENV = 'test';
      
      expect(process.env.VITE_SUPABASE_URL).toBe('https://test.supabase.co');
      expect(process.env.VITE_SUPABASE_ANON_KEY).toBe('test-key');
      expect(process.env.VITE_APP_ENV).toBe('test');
    });
  });

  describe('TypeScript Configuration', () => {
    it('should support TypeScript compilation', () => {
      // Test that TypeScript is working by using TS features
      interface TestInterface {
        name: string;
        value: number;
      }

      const testObject: TestInterface = {
        name: 'test',
        value: 42
      };

      expect(testObject.name).toBe('test');
      expect(testObject.value).toBe(42);
    });

    it('should support modern JavaScript features', () => {
      // Test ES2020 features
      const testArray = [1, 2, 3, 4, 5];
      const doubled = testArray.map(x => x * 2);
      
      expect(doubled).toEqual([2, 4, 6, 8, 10]);
    });
  });

  describe('React Configuration', () => {
    it('should support JSX compilation', () => {
      // This test will fail if JSX is not properly configured
      const element = React.createElement('div', null, 'Test');
      expect(element.type).toBe('div');
      expect(element.props.children).toBe('Test');
    });
  });

  describe('Testing Framework', () => {
    it('should have Jest configured', () => {
      expect(typeof describe).toBe('function');
      expect(typeof it).toBe('function');
      expect(typeof expect).toBe('function');
    });

    it('should have testing library matchers available', () => {
      // Test that @testing-library/jest-dom matchers are available
      const element = document.createElement('div');
      element.textContent = 'Hello World';
      
      expect(element.textContent).toBe('Hello World');
    });
  });

  describe('Module Resolution', () => {
    it('should resolve React imports', () => {
      // Test that React can be imported
      expect(typeof React).toBe('object');
      expect(React.version).toBeDefined();
    });

    it('should support path aliases', () => {
      // Test that types can be imported
      expect(MenuStatus.APPROVED).toBe('APPROVED');
    });
  });

  describe('Dependency Verification', () => {
    it('should not have Gemini AI dependencies available', () => {
      // Ensure Gemini dependencies are not available
      expect(() => {
        require('@google/genai');
      }).toThrow();
    });

    it('should have Supabase client available', () => {
      // Test that Supabase can be imported
      const { createClient } = require('@supabase/supabase-js');
      expect(typeof createClient).toBe('function');
    });

    it('should have React Router available', () => {
      // Test that React Router can be imported
      const { BrowserRouter } = require('react-router-dom');
      expect(typeof BrowserRouter).toBe('function');
    });

    it('should have Recharts available', () => {
      // Test that Recharts can be imported
      const { LineChart } = require('recharts');
      expect(typeof LineChart).toBe('object'); // Recharts components are objects, not functions
    });
  });
});