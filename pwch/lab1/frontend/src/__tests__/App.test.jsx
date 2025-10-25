import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

// Mock fetch globally
global.fetch = vi.fn()

describe('Calculator App', () => {
  beforeEach(() => {
    fetch.mockClear()
    // Default mock for history fetch
    fetch.mockResolvedValue({
      json: async () => ({ history: [] }),
    })
  })

  it('renders calculator display', () => {
    render(<App />)
    const display = document.querySelector('.display')
    expect(display).toHaveTextContent('0')
  })

  it('displays number when clicked', () => {
    render(<App />)
    const button5 = screen.getByRole('button', { name: '5' })
    fireEvent.click(button5)
    const display = document.querySelector('.display')
    expect(display).toHaveTextContent('5')
  })

  it('displays multiple digits', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    const display = document.querySelector('.display')
    expect(display).toHaveTextContent('123')
  })

  it('clears display when C is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    fireEvent.click(screen.getByRole('button', { name: 'C' }))
    const display = document.querySelector('.display')
    expect(display).toHaveTextContent('0')
  })

  it('handles decimal point', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '.' }))
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    const display = document.querySelector('.display')
    expect(display).toHaveTextContent('3.14')
  })

  it('prevents multiple decimal points', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '.' }))
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '.' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    const display = document.querySelector('.display')
    expect(display).toHaveTextContent('3.14')
  })

  it('performs addition calculation', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ history: [] }),
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({ result: 8, num1: 5, num2: 3, operation: '+' }),
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({ history: [] }),
    })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '5' }))
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '=' }))

    await waitFor(() => {
      const display = document.querySelector('.display')
      expect(display).toHaveTextContent('8')
    })
  })

  it('performs subtraction calculation', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ history: [] }),
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({ result: 7, num1: 10, num2: 3, operation: '-' }),
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({ history: [] }),
    })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '0' }))
    fireEvent.click(screen.getByRole('button', { name: '-' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '=' }))

    await waitFor(() => {
      const display = document.querySelector('.display')
      expect(display).toHaveTextContent('7')
    })
  })

  it('performs multiplication calculation', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ history: [] }),
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({ result: 24, num1: 6, num2: 4, operation: '*' }),
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({ history: [] }),
    })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '6' }))
    fireEvent.click(screen.getByRole('button', { name: '*' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: '=' }))

    await waitFor(() => {
      const display = document.querySelector('.display')
      expect(display).toHaveTextContent('24')
    })
  })

  it('performs division calculation', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ history: [] }),
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({ result: 5, num1: 15, num2: 3, operation: '/' }),
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({ history: [] }),
    })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    fireEvent.click(screen.getByRole('button', { name: '/' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '=' }))

    await waitFor(() => {
      const display = document.querySelector('.display')
      expect(display).toHaveTextContent('5')
    })
  })

  it('displays history header', () => {
    render(<App />)
    expect(screen.getByText('Historia obliczeń')).toBeInTheDocument()
  })

  it('displays empty history message', () => {
    render(<App />)
    expect(screen.getByText('Brak historii')).toBeInTheDocument()
  })

  it('displays clear history button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Wyczyść' })).toBeInTheDocument()
  })

  it('clears history when clear button is clicked', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        history: [
          { expression: '5 + 3', result: 8, timestamp: '2025-10-25 12:00:00' },
        ],
      }),
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({ history: [] }),
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('5 + 3')).toBeInTheDocument()
    })

    const clearButton = screen.getByRole('button', { name: 'Wyczyść' })
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(screen.getByText('Brak historii')).toBeInTheDocument()
    })
  })
})

