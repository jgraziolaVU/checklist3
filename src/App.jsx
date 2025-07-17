// src/App.jsx
import { useState, useEffect } from 'react'
import { Trash2, Check, X, Download, Upload, GripVertical } from 'lucide-react'

export default function App() {
  const [inputText, setInputText] = useState('')
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('checklist')
    return saved ? JSON.parse(saved) : []
  })
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [draggedItem, setDraggedItem] = useState(null)

  useEffect(() => {
    localStorage.setItem('checklist', JSON.stringify(items))
  }, [items])

  const handleAddItems = () => {
    const lines = inputText.split('\n').map(line => line.trim()).filter(Boolean)
    const newItems = lines.map(text => ({ 
      id: Date.now() + Math.random(), 
      text, 
      checked: false 
    }))
    setItems(prev => [...prev, ...newItems])
    setInputText('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddItems()
    }
  }

  const toggleItem = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  const clearList = () => {
    if (window.confirm('Are you sure you want to clear all items?')) {
      setItems([])
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditText(item.text)
  }

  const saveEdit = () => {
    setItems(items.map(item => 
      item.id === editingId ? { ...item, text: editText } : item
    ))
    setEditingId(null)
    setEditText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const exportItems = () => {
    const dataStr = JSON.stringify(items, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `checklist-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importItems = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result)
          setItems(imported)
        } catch (error) {
          alert('Invalid file format')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleDragStart = (e, index) => {
    setDraggedItem(index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedItem === null) return

    const draggedItemContent = items[draggedItem]
    const newItems = [...items]
    newItems.splice(draggedItem, 1)
    newItems.splice(dropIndex, 0, draggedItemContent)
    
    setItems(newItems)
    setDraggedItem(null)
  }

  const filteredItems = items.filter(item => {
    if (filter === 'active') return !item.checked
    if (filter === 'completed') return item.checked
    return true
  })

  const completedCount = items.filter(item => item.checked).length
  const totalCount = items.length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ✨ Smart Checklist
          </h1>

          {totalCount > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Progress: {completedCount} of {totalCount} completed
                </span>
                <span className="text-sm font-bold text-indigo-600">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}

          <div className="mb-6">
            <textarea
              className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-colors resize-none"
              placeholder="Enter items (one per line)... Press Ctrl+Enter to add"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            
            <div className="flex flex-wrap gap-2 mt-4">
              <button 
                onClick={handleAddItems} 
                className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 font-medium shadow-md"
              >
                Add Items
              </button>
              <button 
                onClick={clearList} 
                className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all transform hover:scale-105 font-medium shadow-md"
              >
                Clear All
              </button>
              <button 
                onClick={exportItems}
                className="bg-gray-600 text-white px-4 py-3 rounded-xl hover:bg-gray-700 transition-all transform hover:scale-105 shadow-md"
                title="Export list"
              >
                <Download size={20} />
              </button>
              <label className="bg-gray-600 text-white px-4 py-3 rounded-xl hover:bg-gray-700 transition-all transform hover:scale-105 cursor-pointer shadow-md">
                <Upload size={20} />
                <input type="file" accept=".json" onChange={importItems} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex gap-2 mb-6 border-b">
            {['all', 'active', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 font-medium capitalize transition-all ${
                  filter === f 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-xl mb-2">No items yet!</p>
              <p className="text-sm">Add some tasks to get started 🚀</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredItems.map((item, index) => (
                <li
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="group flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-move"
                >
                  <GripVertical className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                  
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleItem(item.id)}
                    className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
                  />
                  
                  {editingId === item.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        className="flex-1 px-3 py-1 border rounded-lg focus:outline-none focus:border-indigo-400"
                        autoFocus
                      />
                      <button onClick={saveEdit} className="text-green-600 hover:text-green-700">
                        <Check size={20} />
                      </button>
                      <button onClick={cancelEdit} className="text-red-600 hover:text-red-700">
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span 
                        onClick={() => startEdit(item)}
                        className={`flex-1 cursor-pointer transition-all ${
                          item.checked 
                            ? 'line-through text-gray-400' 
                            : 'text-gray-700 hover:text-indigo-600'
                        }`}
                      >
                        {item.text}
                      </span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-all transform hover:scale-110"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
