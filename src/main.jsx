import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './admin/App';
import './index.css';
import { RouterProvider, Routes, Route, createBrowserRouter } from 'react-router-dom';

export const App = () => {
    const router = createBrowserRouter(
        [
            {
                path: "*",
                element: (
                    <Routes>
                        <Route path="/*" element={<AdminApp />} />
                    </Routes>
                ),
            },
        ],
    );
    return <RouterProvider router={router} />;
};


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
)
