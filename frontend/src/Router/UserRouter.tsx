import { createBrowserRouter } from 'react-router-dom';
import Landing from '../Page/Landing';
import Home from '../Page/Home';


const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Landing />
  },
  {
    path:'/home',
    element:<Home/>
   
  },

]);

export default appRouter;
