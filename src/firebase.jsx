import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react"
import {
  onAuthStateChanged,
  getAuth
} from "firebase/auth"
import { initializeApp } from "firebase/app"

const app = initializeApp({
  apiKey: "AIzaSyCapJv893V3v4jkFQg88PiLlE57gQzW7Ns",
  authDomain: "iamabm.firebaseapp.com",
  projectId: "iamabm",
  storageBucket: "iamabm.firebasestorage.app",
  messagingSenderId: "44857199556",
  appId: "1:44857199556:web:f74ab6bd038827dd94f291"
})

const auth    = getAuth(app)
const AuthCon = createContext()
const useAuth = () => useContext(AuthCon)

export function AuthProvider({ children }) {
  const [ user, setUser ] = useState(undefined)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])
  return <AuthCon.Provider value={user}>{ children }</AuthCon.Provider>
}

export { useAuth, auth, app }