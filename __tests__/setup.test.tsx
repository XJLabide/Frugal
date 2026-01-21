
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('Vitest Setup', () => {
    it('runs a simple test', () => {
        expect(1 + 1).toBe(2)
    })

    it('renders a React component correctly', () => {
        function TestComponent() {
            return <div>Hello Vitest</div>
        }

        render(<TestComponent />)
        expect(screen.getByText('Hello Vitest')).toBeInTheDocument()
    })
})
