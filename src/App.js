import Layout from './Layout/Layout';
import Main from './pages/Main';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout/>}>
        <Route index element={<Main/>}/>  
        </Route>
      </Routes>    
    </BrowserRouter>
    </>
  );
}

export default App;
