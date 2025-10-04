import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'https://lab1-backend.azurewebsites.net';

function App() {
  const [display, setDisplay] = useState('0')
  const [num1, setNum1] = useState('')
  const [num2, setNum2] = useState('')
  const [operation, setOperation] = useState(null)
  const [history, setHistory] = useState([])
  const [waitingForSecondNumber, setWaitingForSecondNumber] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history.php`)
      const data = await response.json()
      if (data.history) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const saveToHistory = async (historyEntry) => {
    try {
      const response = await fetch(`${API_URL}/history.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', entry: historyEntry })
      })
      const data = await response.json()
      if (data.history) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error('Error saving history:', error)
    }
  }

  const performCalculation = async () => {
    const n1 = parseFloat(num1)
    const n2 = parseFloat(display)
    
    try {
      const response = await fetch(`${API_URL}/calculate.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num1: n1, num2: n2, operation })
      })
      
      const data = await response.json()
      
      const historyEntry = {
        expression: `${n1} ${operation} ${n2}`,
        result: data.result,
        timestamp: new Date().toLocaleString('pl-PL')
      }
      
      await saveToHistory(historyEntry)
      
      return data.result
    } catch (error) {
      console.error('Error:', error)
      return 'Error'
    }
  }

  const clearHistory = async () => {
    try {
      await fetch(`${API_URL}/history.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      })
      setHistory([])
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  const handleNumberClick = (digit) => {
    if (waitingForSecondNumber) {
      setDisplay(String(digit))
      setWaitingForSecondNumber(false)
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit)
    }
  }

  const handleDecimalClick = () => {
    if (waitingForSecondNumber) {
      setDisplay('0.')
      setWaitingForSecondNumber(false)
    } else if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const handleOperationClick = (op) => {
    const inputValue = parseFloat(display)
    
    if (num1 === '') {
      setNum1(inputValue)
    } else if (operation) {
      const result = performCalculation()
      setDisplay(String(result))
      setNum1(result)
    }
    
    setWaitingForSecondNumber(true)
    setOperation(op)
  }

  const handleEquals = async () => {
    if (operation && num1 !== '') {
      const result = await performCalculation()
      setDisplay(String(result))
      setNum1('')
      setOperation(null)
      setWaitingForSecondNumber(false)
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setNum1('')
    setNum2('')
    setOperation(null)
    setWaitingForSecondNumber(false)
  }

  const loadFromHistory = (expression, result) => {
    setDisplay(String(result))
    setNum1(result)
    setOperation(null)
  }

  return (
    <div className="calculator-container">
      <div className="calculator">
        <div className="display">{display}</div>
        
        <div className="buttons">
          <button onClick={handleClear} className="span-2">C</button>
          <button onClick={() => handleOperationClick('/')} className="operator">/</button>
          <button onClick={() => handleOperationClick('*')} className="operator">*</button>
          
          <button onClick={() => handleNumberClick(7)}>7</button>
          <button onClick={() => handleNumberClick(8)}>8</button>
          <button onClick={() => handleNumberClick(9)}>9</button>
          <button onClick={() => handleOperationClick('-')} className="operator">-</button>
          
          <button onClick={() => handleNumberClick(4)}>4</button>
          <button onClick={() => handleNumberClick(5)}>5</button>
          <button onClick={() => handleNumberClick(6)}>6</button>
          <button onClick={() => handleOperationClick('+')} className="operator">+</button>
          
          <button onClick={() => handleNumberClick(1)}>1</button>
          <button onClick={() => handleNumberClick(2)}>2</button>
          <button onClick={() => handleNumberClick(3)}>3</button>
          <button onClick={handleDecimalClick}>.</button>
          
          <button onClick={() => handleNumberClick(0)} className="span-2">0</button>
          <button onClick={handleEquals} className="span-2 equals">=</button>
        </div>
      </div>

      <div className="history-panel">
        <div className="history-header">
          <h3>Historia obliczeń</h3>
          <button onClick={clearHistory} className="clear-history">Wyczyść</button>
        </div>
        <div className="history-list">
          {history.length === 0 ? (
            <p className="empty-history">Brak historii</p>
          ) : (
            history.map((entry, index) => (
              <div 
                key={index} 
                className="history-item"
                onClick={() => loadFromHistory(entry.expression, entry.result)}
              >
                <div className="expression">{entry.expression}</div>
                <div className="result">= {entry.result}</div>
                <div className="timestamp">{entry.timestamp}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App
