import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "@mui/material"
import { AuthProvider }  from "@/firebase"
import { createRoot }    from "react-dom/client"
import { StrictMode }    from "react"

import theme from "@/theme"
import App from "@/app"
import "@/main.css"
createRoot(document.getElementById("app")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <App/>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)