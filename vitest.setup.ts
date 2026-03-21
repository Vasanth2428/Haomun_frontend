import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables
process.env.JWT_SECRET = 'test_secret'
process.env.GEMINI_API_KEY = 'test_key_long_enough_to_pass_validation'
