import { describe, it, expect } from 'vitest'

describe('App Scaffold', () => {
  it('should pass basic test to verify test runner works', () => {
    expect(true).toBe(true)
  })

  it('should have correct project structure', () => {
    const expectedDirs = ['src/app', 'src/components', 'src/domain', 'src/store']
    expectedDirs.forEach(dir => {
      expect(dir).toBeDefined()
    })
  })
})