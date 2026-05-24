import { createTheme } from "@mui/material"
function buildTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#00fafa"
      },
      secondary: {
        main: "#fa00fa"
      },
      ...(mode === "light" ? {
        text: {
          primary: "#091016",
          secondary: "#5e6c84"
        }
      } : {
        text: {
          primary: "#e8f0f7",
          secondary: "#8899aa"
        },
        background: {
          default: "#0d1117",
          paper: "#161b22"
        }
      })
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
}

export const lightTheme = buildTheme("light")
export const darkTheme = buildTheme("dark")