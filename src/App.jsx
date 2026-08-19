import { Routes, Route } from 'react-router-dom';
import HomePage from './features/home/HomePage.jsx';
import EditorPage from './features/editor/EditorPage.jsx';
import ToastViewport from './components/ToastViewport.jsx';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor/:projectId" element={<EditorPage />} />
      </Routes>
      <ToastViewport />
    </>
  );
}
