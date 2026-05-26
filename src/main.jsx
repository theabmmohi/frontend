import { createContext, useState, StrictMode } from "react"
import { ThemeProvider, CssBaseline } from "@mui/material"
import { BrowserRouter } from "react-router-dom"
import { createRoot }    from "react-dom/client"
import { lightTheme, darkTheme } from "@/theme"
import { AuthProvider }  from "@/firebase"
import App from "@/app"
import "@/main.css"

export const ThemeCtx = createContext()

function Root() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark")
  const toggle = () => setDark(d => {
    localStorage.setItem("theme", !d ? "dark" : "light")
    return !d
  })
  return (
    <ThemeCtx.Provider value={{ dark, toggle }}>
      <ThemeProvider theme={dark ? darkTheme : lightTheme}>
        <CssBaseline/>
        <AuthProvider>
          <BrowserRouter>
            <App/>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ThemeCtx.Provider>
  )
}
createRoot(document.getElementById("app")).render(
  <StrictMode>
    <Root/>
  </StrictMode>
)