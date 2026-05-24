import {
  useEffect,
  useState
} from "react"
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "firebase/auth"
import {
  Typography,
  IconButton,
  TextField,
  Snackbar,
  Divider,
  Button,
  Slide,
  Stack,
  Box
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import { Capacitor } from "@capacitor/core"
import { useAuth, auth } from "@/firebase"

import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import VisibilityIcon from "@mui/icons-material/Visibility"
import GoogleIcon from "@mui/icons-material/Google"
import GitHubIcon from "@mui/icons-material/GitHub"

export default function SignUp() {
  const navigate = useNavigate()
  const user     = useAuth()
  
  const [name,      setName]      = useState("")
  const [email,     setEmail]     = useState("")
  const [password,  setPassword]  = useState("")
  const [confirm,   setConfirm]   = useState("")
  const [showPassM, setShowPassM] = useState(false)
  const [showPassC, setShowPassC] = useState(false)
  const [error,     setError]     = useState("")
  const [open,      setOpen]      = useState(false)
  
  useEffect(() => {
    if (user) navigate("/")
  }, [user, navigate])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    if (!name.trim()) {
      setError("Name is required")
      setOpen(true)
      return
    }
    if (!email) {
      setError("Email is required")
      setOpen(true)
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setOpen(true)
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match")
      setOpen(true)
      return
    }
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(newUser, { displayName: name.trim() })
      await sendEmailVerification(newUser)
      setError("")
      setOpen(true)
      setTimeout(() => navigate("/signin"), 4000)
    } catch(e) {
      setError(e.message)
      setOpen(true)
    }
  }
  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      navigate("/")
    } catch(e) {
      setError(e.message)
      setOpen(true)
    }
  }
  const handleGithub = async () => {
    try {
      await signInWithPopup(auth, new GithubAuthProvider())
      navigate("/")
    } catch(e) {
      setError(e.message)
      setOpen(true)
    }
  }
  
  return (
    <Box sx={{ maxWidth: 400, mx: "auto", p: 5 }}>
      <Typography variant="h5" sx={{ textAlign: "center", my: 2.5 }}>Sign Up</Typography>
      <Stack component="form" onSubmit={handleSubmit} spacing={2.5} sx={{ alignItems: "center" }}>
        <TextField fullWidth size="small" label="Name" value={name} onChange={e => setName(e.target.value)}/>
        <TextField fullWidth size="small" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}/>
        <TextField fullWidth size="small" label="Password" type={showPassM?"text":"password"} value={password} onChange={e => setPassword(e.target.value)} slotProps={{ input: { endAdornment: (<IconButton size="small" onClick={() => setShowPassM(!showPassM)}>{showPassM?<VisibilityIcon/>:<VisibilityOffIcon/>}</IconButton>) } }}/>
        <TextField fullWidth size="small" label="Confirm Password" type={showPassC?"text":"password"} value={confirm} onChange={e => setConfirm(e.target.value)} slotProps={{ input: { endAdornment: (<IconButton size="small" onClick={() => setShowPassC(!showPassC)}>{showPassC?<VisibilityIcon/>:<VisibilityOffIcon/>}</IconButton>) } }}/>
        <Stack direction="row" sx={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={() => navigate("/signin")}>Already Have An Account? Sign In</Button>
        </Stack>
        <Button sx={{ width: "75%" }} type="submit" variant="contained">Sign Up</Button>
        
        {!Capacitor.isNativePlatform() && (<>
          <Divider sx={{ width: "100%"}}>Or Continue With</Divider>
          <Stack spacing={1.25} sx={{ width: "75%" }}>
            <Button variant="outlined" startIcon={<GoogleIcon/>} onClick={handleGoogle} sx={{ color: "black" }}>Google</Button>
            <Button variant="outlined" startIcon={<GitHubIcon/>} onClick={handleGithub} sx={{ color: "black" }}>Github</Button>
          </Stack>
        </>)}
        
        <Snackbar
          open={open}
          onClose={() => setOpen(false)}
          message={error}
          autoHideDuration={error ? Math.max(4000, error.length * 80) : 4000}
          slots={{ transition: Slide }}
        />
      </Stack>
    </Box>
  )
}