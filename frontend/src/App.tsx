import { BrowserRouter, Routes, Route } from 'react-router-dom'

import StudentPortal from './StudentPortal'
import Home from './Home'
import AdminPanel from './AdminPanel'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/portal' element={<StudentPortal />} />
        <Route path='/admin' element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
