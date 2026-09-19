import React, { useState } from "react" 
import  "../auth.form.scss";
import { useNavigate,Link, Navigate } from "react-router";
import { useAuth } from "../hook/userAuth";


const Login = () => {

  const {loading , handlelogin} = useAuth()
  const [email , setemail] = useState("")
  const [password , setpassword] = useState("")
  const Navigate = useNavigate()

  const handleSubmit = async (e) =>{
    e.preventDefault() 
    await handlelogin({email,password})
    Navigate('/')
  }

  if(loading){
    return (<main><h1>loading......</h1></main>)
  }

  return (
    <main>  
      <div className="form-control">
        <h1>Login Form</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group"> 
            <label htmlFor="email">Enter Email address :</label>
            <input
            onChange={(e) => {setemail(e.target.value)}}
            type="email" name="email" id="email" placeholder="Enter Email Address"/>
          </div>
          <div className="input-group"> 
            <label htmlFor="pass">Enter Password :</label>
            <input 
            onChange={(e) => {setpassword(e.target.value)}}
            type="password" name="pass" id="pass" placeholder="Enter Password"/>
          </div>
          <button className="button primary-btn">Login</button>
        </form>
        <p>Create an account ? <Link to={"/Register"}>Register</Link></p>
      </div>
    </main>
  )
}

export default Login