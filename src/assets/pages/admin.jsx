import {
  useEffect,
  useState
} from "react"
import api from "@/api"

export default function Admin() {
  const [m, setM] = useState("Loading...")
  useEffect(() => {
    async function load() {
      api.get("/")
      .then(({ data }) => setM(data))
      .catch(() => setM("Server Offline"))
    }
    load()
  }, [])
  
  return(
    <>
      Hii Admin
      <br/>
      Server Says:
      <br/>
      {m}
    </>
  )
}