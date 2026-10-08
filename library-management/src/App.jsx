import { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [books, setBooks] = useState(() => JSON.parse(localStorage.getItem("books")) || [])
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem("users")) || [])
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem("transactions")) || [])
  const [currentUser, setCurrentUser] = useState(null)
  const [page, setPage] = useState('login')

  const [loginId, setLoginId] = useState('')
  const [bookForm, setBookForm] = useState({ title: '', author: '', genre: '', isbn: '', quantity: '' })
  const [transForm, setTransForm] = useState({ bookId: '', qty: '' })
  const [userForm, setUserForm] = useState({ name: '', memberId: '', role: '' })

  useEffect(() => { localStorage.setItem("books", JSON.stringify(books)) }, [books])
  useEffect(() => { localStorage.setItem("users", JSON.stringify(users)) }, [users])
  useEffect(() => { localStorage.setItem("transactions", JSON.stringify(transactions)) }, [transactions])
  useEffect(() => {
    if (users.length === 0) {
      const admin = [{ name: "Admin", memberId: "9010", role: "Librarian" }]
      setUsers(admin)
    }
  }, [])

  // Login
  const handleLogin = () => {
    const user = users.find(u => u.memberId == loginId)
    if (user) { setCurrentUser(user); setPage('dashboard') }
    else alert("Invalid Member ID!")
  }
  const logout = () => { setCurrentUser(null); setPage('login'); setLoginId('') }

  // Books
  const addBook = () => {
    if (!bookForm.title ||!bookForm.isbn) return alert("Title and ISBN required")
    setBooks([...books, {...bookForm, quantity: parseInt(bookForm.quantity) || 0, id: Date.now() }])
    setBookForm({ title: '', author: '', genre: '', isbn: '', quantity: '' })
  }
  const deleteBook = (id) => { if (confirm("Delete?")) setBooks(books.filter(b => b.id!= id)) }
  const updateBook = (id) => {
    const q = prompt("New Qty:")
    if (q!= null) setBooks(books.map(b => b.id == id? {...b, quantity: parseInt(q) || 0 } : b))
  }

  // Transactions
  const addStock = () => {
    const id = +transForm.bookId; const qty = +transForm.qty
    const book = books.find(b => b.id == id)
    if (!book ||!qty) return alert("Select book and qty")
    setBooks(books.map(b => b.id == id? {...b, quantity: b.quantity + qty } : b))
    setTransactions([...transactions, { book: book.title, type: "ADD STOCK", qty, date: new Date().toLocaleString() }])
  }
  const borrowBook = () => {
    const id = +transForm.bookId; const qty = +transForm.qty
    const book = books.find(b => b.id == id)
    if (!book ||!qty) return alert("Select book and qty")
    if (book.quantity < qty) return alert("Not enough stock")
    setBooks(books.map(b => b.id == id? {...b, quantity: b.quantity - qty } : b))
    setTransactions([...transactions, { book: book.title, type: "BORROWED", qty, date: new Date().toLocaleString() }])
  }

  // Users
  const addUser = () => {
    if (!userForm.name ||!userForm.memberId) return alert("Fill all fields")
    if (users.find(u => u.memberId == userForm.memberId)) return alert("ID exists")
    setUsers([...users, {...userForm, role: userForm.role || "Member" }])
    setUserForm({ name: '', memberId: '', role: '' })
  }
  const deleteUser = (id) => {
    if (id === "9010") return alert("Cannot delete admin")
    if (confirm("Delete?")) setUsers(users.filter(u => u.memberId!= id))
  }

  // COMPONENTS
  const Nav = () => (
    <>
      <h2>Welcome, {currentUser?.name} | Role: {currentUser?.role}</h2>
      <nav>
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('books')}>Book Management</button>
        <button onClick={() => setPage('transactions')}>Transactions</button>
        <button onClick={() => setPage('users')}>User Management</button>
        <button className="btn-danger" onClick={logout}>Logout</button>
      </nav>
      <hr />
    </>
  )

  if (page === 'login') {
    return (
      <div className="container">
        <h1>Community Library Management System</h1>
        <div className="login-card">
          <h2>Librarian Login</h2>
          <p>Enter Member ID to login</p>
          <input value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="Member ID" />
          <button className="btn" onClick={handleLogin}>Login</button>
          <p><b>Admin ID:</b> 9010</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Community Library Management System</h1>

      <Nav />

      {page === 'dashboard' && (
        <div>
          <h3>Book Availability Dashboard</h3>
          <p>Books with fewer than 2 copies are highlighted</p>
          <table>
            <tr><th>Title</th><th>Author</th><th>Genre</th><th>Quantity</th><th>Status</th></tr>
            {books.map(b => (
              <tr key={b.id} className={b.quantity < 2? 'low-stock' : ''}>
                <td>{b.title}</td><td>{b.author}</td><td>{b.genre}</td><td>{b.quantity}</td><td>{b.quantity < 2? 'LOW STOCK' : 'In Stock'}</td>
              </tr>
            ))}
          </table>
        </div>
      )}

      {page === 'books' && (
        <div>
          <h3>Add New Book</h3>
          <div className="form-grid">
            <input placeholder="Title" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value })} /><br></br>
            <input placeholder="Author" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value })} /><br></br>
            <input placeholder="Genre" value={bookForm.genre} onChange={e => setBookForm({...bookForm, genre: e.target.value })} /><br></br>
            <input placeholder="ISBN" value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value })} /><br></br>
            <input type="number" placeholder="Initial Quantity" value={bookForm.quantity} onChange={e => setBookForm({...bookForm, quantity: e.target.value })} /><br></br>
            <button className="btn" onClick={addBook}>Add Book</button>
          </div>
          <hr />
          <table>
            <tr><th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Qty</th><th>Actions</th></tr>
            {books.map(b => (
              <tr key={b.id}>
                <td>{b.title}</td><td>{b.author}</td><td>{b.genre}</td><td>{b.isbn}</td><td>{b.quantity}</td>
                <td><button className="btn" onClick={() => updateBook(b.id)}>Update</button> <button className="btn btn-danger" onClick={() => deleteBook(b.id)}>Delete</button></td>
              </tr>
            ))}
          </table>
        </div>
      )}

      {page === 'transactions' && (
        <div>
          <h3>Record Transaction</h3>
          <div className="form-grid">
            <select value={transForm.bookId} onChange={e => setTransForm({...transForm, bookId: e.target.value })}><br></br>
              <option value=''>Select Book</option>
              {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select><br></br>
            <input type="number" placeholder="Quantity" value={transForm.qty} onChange={e => setTransForm({...transForm, qty: e.target.value })} /><br></br>  
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn" onClick={addStock}>Add Stock</button>
              <button className="btn btn-danger" onClick={borrowBook}>Borrow Book</button>
            </div>
          </div>
          <hr />
          <h3>Transaction History</h3>
          <table><tr><th>Book Title</th><th>Type</th><th>Qty</th><th>Date</th></tr>
            {transactions.map((t, i) => <tr key={i}><td>{t.book}</td><td>{t.type}</td><td>{t.qty}</td><td>{t.date}</td></tr>)}
          </table>
        </div>
      )}

      {page === 'users' && (
        <div>
          <h3>Add New User</h3>
          <div className="form-grid">
            <input placeholder="Full Name" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value })} /><br></br>
            <input placeholder="Member ID" value={userForm.memberId} onChange={e => setUserForm({...userForm, memberId: e.target.value })} /><br></br>
            <input placeholder="Role e.g. Librarian, Member" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value })} /><br></br>
            <button className="btn" onClick={addUser}>Add User</button>
          </div>
          <hr />
          <table><tr><th>Name</th><th>Member ID</th><th>Role</th><th>Action</th></tr>
            {users.map(u => <tr key={u.memberId}><td>{u.name}</td><td>{u.memberId}</td><td>{u.role}</td><td><button className="btn btn-danger" onClick={() => deleteUser(u.memberId)}>Delete</button></td></tr>)}
          </table>
        </div>
      )}
    </div>
  )
}