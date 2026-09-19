import { useContext , useEffect } from "react";
import { AuthContext } from "../auth.context.jsx";
import {register , login , getme, logout} from "../server/auth.api";

export const useAuth = () =>{ 

  const context = useContext(AuthContext)
  const {user , setUser , loading , setloading} = context;

const handlelogin = async ({ email, password }) => {
  setloading(true);

  try {
    const data = await login({ email, password });

    setUser(data.user);

  } catch (err) {
    console.log(err);
  } finally {
    setloading(false);
  }
};

    const handleregister = async ({username , email , password}) =>{
    setloading(true)
    try{
      const data = await register({username , email , password})
      setUser(data.user)
    }catch(err){

    }finally{
    setloading(false) 
    }
  }

    const handlelogout = async () =>{
    setloading(true)
    try{
      const data = await logout()
      setUser(null)
    }catch(err){

    }finally{
      setloading(false) 
    }
  }
   
    useEffect(() =>{

    const getAndSetUser = async()=>{
      try{
      const data = await getme()
      setUser(data.user)
      }catch(err){}finally{
        
         setloading(false)
      }
    
    }

    getAndSetUser()
  },[])

  return {user , loading , handlelogin , handlelogout , handleregister}
}