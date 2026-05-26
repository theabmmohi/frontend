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
          primary: "#000000",
          secondary: "#111111"
        },
        background: {
          default: "#eeeeee",
          paper: "#ffffff"
        }
      } : {
        text: {
          primary: "#ffffff",
          secondary: "#eeeeee"
        },
        background: {
          default: "#111111",
          paper: "#000000"
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