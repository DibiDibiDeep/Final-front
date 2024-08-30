import Layout from './Layout/Layout';
import Main from './pages/Main';
import HealthCheck from './pages/HealthCheck';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {

  

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout/>}>
        <Route index element={<Main/>}/> 
        <Route path="/health" element={<HealthCheck />} /> 
        </Route>
      </Routes>    
    </BrowserRouter>
    </>
  );
}

export default App;
