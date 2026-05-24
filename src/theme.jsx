import { createTheme } from "@mui/material"
export default createTheme({
  palette: {
    primary: {
      main: "#00fafa"
    },
    secondary: {
      main: "#fa00fa"
    },
    text: {
      primary: "#091016",
      secondary: "#5e6c84"
    },
    mode: "light"
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none"
        }
      }
    }
  }
})