// src/App.jsx
import { useState, useEffect } from 'react'

export default function App() {
  const [inputText, setInputText] = useState('')
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('checklist')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('checklist', JSON.stringify(items))
  }, [items])

  const handleAddItems = () => {
    const lines = inputText.split('\n').map(line => line.trim()).filter(Boolean)
    const newItems = lines.map(text => ({ text, checked: false }))
    setItems(prev => [...prev, ...newItems])
    setInputText('')
  }

  const toggleItem = (index) => {
    const newItems = [...items]
    newItems[index].checked = !newItems[index].checked
    setItems(newItems)
  }

  const clearList = () => {
    setItems([])
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">📝 Custom Checklist</h1>

      <textarea
        className="w-full h-32 p-2 border rounded mb-2"
        placeholder="Enter one checklist item per line..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      ></textarea>

      <div className="flex gap-2 mb-4">
        <button onClick={handleAddItems} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add to List
        </button>
        <button onClick={clearList} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Clear All
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(index)}
              className="mr-2"
            />
            <span className={item.checked ? 'line-through text-gray-500' : ''}>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
