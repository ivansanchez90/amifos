import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudentPortal from './StudentPortal';
import Home from './Home';
import AdminPanel from './AdminPanel';
function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: '/', element: _jsx(Home, {}) }), _jsx(Route, { path: '/portal', element: _jsx(StudentPortal, {}) }), _jsx(Route, { path: '/admin', element: _jsx(AdminPanel, {}) })] }) }));
}
export default App;
