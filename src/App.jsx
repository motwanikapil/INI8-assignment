import { useRef } from 'react'
import { useState } from 'react'
import { useReducer } from 'react'

const initialState = JSON.parse(localStorage.getItem('todos')) || []

const updateLocalStorage = (state) =>
  localStorage.setItem('todos', JSON.stringify(state))

const reducer = (state, action) => {
  const { type, payload } = action // Destructure action for cleaner access

  switch (type) {
    case 'TODO_CREATE': {
      const createdState = [...state, payload]
      updateLocalStorage(createdState)
      return createdState
    }

    case 'TODO_UPDATE': {
      const updatedState = state.map((el) =>
        el.id === action.payload.id ? payload : el
      )
      updateLocalStorage(updatedState)
      return updatedState
    }

    case 'TODO_DELETE': {
      const filteredState = state.filter((el) => el.id !== action.payload)
      updateLocalStorage(filteredState)
      return filteredState
    }

    case 'TODO_COMPLETED': {
      const completedState = state.map((el) =>
        el.id === action.payload ? { ...el, isCompleted: !el.isCompleted } : el
      )

      updateLocalStorage(completedState)
      return completedState
    }

    default:
      throw new Error('Unknown Action')
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [editMode, setEditMode] = useState(null)
  const [filter, setFilter] = useState(null)

  return (
    <main>
      <header className="text-3xl mb-3 px-2">
        <em>
          INI<b>8</b> Assignment - TODO LIST
        </em>
      </header>
      <section className="px-10">
        <div className="flex justify-between">
          <NewTodo
            onAddTodo={(todo) =>
              dispatch({ type: 'TODO_CREATE', payload: todo })
            }
          />
          <select
            name="filter"
            id="filter"
            onChange={(e) => {
              const value = e.target.value
              if (value === 'null') {
                setFilter(null)
              } else {
                setFilter(e.target.value === 'true')
              }
            }}
            placeholder="All"
            className="px-4 py-2 w-64 border-2 border-black rounded-md"
          >
            <option value="null">All</option>
            <option value="true">Completed</option>
            <option value="false">Incomplete</option>
          </select>
        </div>
        {/* All todos */}
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-5">
          {state
            .filter((el) => filter === null || el.isCompleted === filter)
            .map((todo) => (
              <Todo
                todo={todo}
                key={todo.id}
                onCompleted={(id) => {
                  dispatch({ type: 'TODO_COMPLETED', payload: id })
                }}
                onEditTodo={(todo) =>
                  dispatch({ type: 'TODO_UPDATE', payload: todo })
                }
                onDelete={(id) =>
                  dispatch({ type: 'TODO_DELETE', payload: id })
                }
                editMode={editMode}
                setEditMode={setEditMode}
              />
            ))}
        </ul>
      </section>
    </main>
  )
}

function Todo({
  todo,
  onCompleted,
  onEditTodo,
  onDelete,
  editMode,
  setEditMode,
}) {
  const isEditOn = editMode === todo.id
  const { isCompleted, filter } = todo
  return (
    <li className="border-2 border-slate-800 px-3 py-2 h-64 rounded-md">
      {!isEditOn && (
        <section className="grid items-center grid-cols-12">
          <input
            type="checkbox"
            className="w-5 h-5 col-span-1"
            onChange={() => onCompleted(todo.id)}
            checked={todo.isCompleted}
          />
          <h1
            className={`text-lg font-bold col-span-10 text-center ${
              isCompleted ? 'line-through' : ''
            }`}
            onClick={() => setEditMode(todo.id)}
          >
            {todo.title}
          </h1>
          <button
            onClick={() => onDelete(todo.id)}
            className="text-red-400 hover:text-red-600 font-extrabold text-3xl"
          >
            X
          </button>
        </section>
      )}
      {isEditOn ? (
        <EditTodo
          todo={todo}
          onEditTodo={onEditTodo}
          onEditDone={() => setEditMode(null)}
        />
      ) : (
        <>
          <p
            className={`text-md h-44 ${isCompleted ? 'line-through' : ''}`}
            onClick={() => setEditMode(todo.id)}
          >
            {todo.content}
          </p>
        </>
      )}
    </li>
  )
}

function NewTodo({ onAddTodo }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const titleRef = useRef()
  return (
    <form
      className="flex gap-2 w-full me-3"
      onSubmit={(e) => {
        e.preventDefault()
        onAddTodo({
          id: crypto.randomUUID(),
          title,
          content,
          isCompleted: false,
        })
        setTitle('')
        setContent('')
        titleRef.current.focus()
      }}
    >
      <input
        name="title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter title"
        className="border-2 border-slate-800 px-4 py-2 rounded-xl w-6/12"
        ref={titleRef}
        required
      />
      <input
        name="content"
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter content"
        className="border-2 border-slate-800 px-4 py-2 rounded-xl w-6/12"
        required
      />
      <button className="px-4 py-2 text-white bg-blue-400 hover:bg-blue-500 rounded-xl w-52">
        + Add Todo
      </button>
    </form>
  )
}

function EditTodo({ todo, onEditTodo, onEditDone }) {
  const [title, setTitle] = useState(todo.title)
  const [content, setContent] = useState(todo.content)
  return (
    <form
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        onEditTodo({
          ...todo,
          title,
          content,
        })
        onEditDone()
      }}
    >
      <input
        name="title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter title"
        className="border-2 border-slate-800 px-4 rounded-md"
        required
      />
      <textarea
        name="content"
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter content"
        className="border-2 border-slate-800 h-36 py-2 rounded-md px-2"
        required
      ></textarea>
      <button className="px-4 text-white bg-blue-400 rounded-xl py-1">
        Edit Todo
      </button>
    </form>
  )
}

export default App
