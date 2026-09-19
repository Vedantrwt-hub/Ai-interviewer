import React, { useState } from "react";
import { useNavigate,Link} from 'react-router';
import { useAuth } from "../hook/userAuth";

const Register = () =>{

   const navigate = useNavigate()
   const [usename , setusername] = useState("")
   const [email , setemail] = useState("")
   const [password , setpassword] = useState("")

   const {loading,handleregister} = useAuth()

    const handleSubmit = async (e) =>{
    e.preventDefault() 
    await handleregister({username,email,password})
    navigate()
  }

  return (
      <main>  
      <div className="form-control">
        <h1>Registration Form</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group"> 
            <label htmlFor="username">Enter username :</label>
            <input
            onChange={(e) =>{setusername(e.target.value)}}
            type="text" name="username" id="username" placeholder="Enter username"/>
          </div>
          <div className="input-group"> 
            <label htmlFor="email">Enter Email address :</label>
            <input
            onChange={(e) =>{setemail(e.target.value)}}
            type="email" name="email" id="email" placeholder="Enter Email Address"/>
          </div>
          <div className="input-group"> 
            <label htmlFor="pass">Enter Password :</label>
            <input
            onChange={(e) =>{setpassword(e.target.value)}}
            type="password" name="pass" id="pass" placeholder="Enter Password"/>
          </div>
          <button className="button primary-btn">Register</button>
        </form>

        <p>Already have an account? <Link to={"/Login"}>Login</Link></p>
      </div>
    </main>
  )
}

export default  Register