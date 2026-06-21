import { useEffect, useState } from 'react'
import axios from 'axios'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function App() {
  const [users, setUsers] = useState([])
  const [currentUserId, setCurrentUserId] = useState(1)
  const [documents, setDocuments] = useState([])
  const [activeDoc, setActiveDoc] = useState(null)
  const [title, setTitle] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Underline,
    ],
    content: '',
  })

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    async function refreshDocuments() {
      setActiveDoc(null)
      await loadDocuments()
    }

    refreshDocuments()
  }, [currentUserId])

  async function loadUsers() {
    const res = await axios.get(`${API}/users`)
    setUsers(res.data)
  }

  async function loadDocuments() {
    const res = await axios.get(`${API}/documents?userId=${currentUserId}`)
    setDocuments(res.data)
  }

  async function createDocument() {
    const res = await axios.post(`${API}/documents`, {
      ownerId: currentUserId,
      title: 'Untitled Document',
    })

    await loadDocuments()
    openDocument(res.data.id)
  }

  async function openDocument(id) {
    const res = await axios.get(`${API}/documents/${id}`)
    setActiveDoc(res.data)
    setTitle(res.data.title)

    try {
      editor.commands.setContent(JSON.parse(res.data.content_json || '{}'))
    } catch {
      editor.commands.setContent('')
    }
  }

  async function saveDocument() {
    if (!activeDoc) return

    await axios.put(`${API}/documents/${activeDoc.id}`, {
      title,
      content_json: JSON.stringify(editor.getJSON()),
    })

    await loadDocuments()
    alert('Saved!')
  }

  async function shareDocument() {
    if (!activeDoc) return

    await axios.post(`${API}/documents/${activeDoc.id}/share`, {
      userId: 2,
    })

    alert('Shared with Reviewer!')
  }

  async function uploadFile(e) {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const uploadRes = await axios.post(`${API}/upload`, formData)

    const contentJson = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: uploadRes.data.content,
            },
          ],
        },
      ],
    }

    const docRes = await axios.post(`${API}/documents`, {
      ownerId: currentUserId,
      title: file.name,
    })

    await axios.put(`${API}/documents/${docRes.data.id}`, {
      title: file.name,
      content_json: JSON.stringify(contentJson),
    })

    await loadDocuments()

    setActiveDoc({
      id: docRes.data.id,
      owner_id: currentUserId,
      title: file.name,
      content_json: JSON.stringify(contentJson),
    })

    setTitle(file.name)
    editor.commands.setContent(contentJson)

    e.target.value = ''
  }

  return (
    <div className='app'>
      <aside className='sidebar'>
        <h2>Ajaia Docs</h2>

        <label>User</label>
        <select
          value={currentUserId}
          onChange={(e) => setCurrentUserId(Number(e.target.value))}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <button onClick={createDocument}>+ New Document</button>

        <div className='upload'>
          <label>Import .txt / .md</label>
          <input type='file' accept='.txt,.md' onChange={uploadFile} />
        </div>

        <h3>Documents</h3>

        {documents.map((doc) => (
          <button
            key={doc.id}
            className='doc-button'
            onClick={() => openDocument(doc.id)}
          >
            <span>{doc.title}</span>
            <small>{doc.access_type}</small>
          </button>
        ))}
      </aside>

      <main className='editor-area'>
        {!activeDoc ? (
          <div className='empty-state'>
            <h1>Select or create a document</h1>
            <p>Create, edit, import, save, and share lightweight documents.</p>
          </div>
        ) : (
          <>
            <input
              className='title-input'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className='toolbar'>
              <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()}>
                I
              </button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
                U
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                H1
              </button>
              <button
                type='button'
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                Bullet
              </button>

              <button
                type='button'
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                Number
              </button>

              <button onClick={saveDocument}>Save</button>
              <button onClick={shareDocument}>Share with Reviewer</button>
            </div>

            <div className='editor-box'>
              <EditorContent editor={editor} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
