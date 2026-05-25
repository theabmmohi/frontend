import {
  useTransition,
  useContext,
  useEffect,
  Suspense,
  lazy
} from "react"
import {
  useLocation,
  useNavigate,
  Routes,
  Route
} from "react-router-dom"
import {
  getAuth,
  signOut
} from "firebase/auth"
import PopupState, {
  bindTrigger,
  bindMenu
} from "material-ui-popup-state"
import {
  BottomNavigationAction,
  BottomNavigation,
  CircularProgress,
  ListItemIcon,
  Typography,
  IconButton,
  Backdrop,
  MenuItem,
  Divider,
  Toolbar,
  AppBar,
  Avatar,
  Badge,
  Menu,
  Box
} from "@mui/material"
import { App as CapApp } from "@capacitor/app"
import { useAuth } from "@/firebase"
import { useCart } from "@/useCart"
import { ThemeCtx } from "@/main"

import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import StorefrontIcon from "@mui/icons-material/Storefront"
import LightModeIcon from "@mui/icons-material/LightMode"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import SettingsIcon from "@mui/icons-material/Settings"
import LogoutIcon from "@mui/icons-material/Logout"
import LoginIcon from "@mui/icons-material/Login"

const delay  = (ms) => new Promise(res => setTimeout(res, ms))
const ms     = 250
const Cart   = lazy(() => Promise.all([import("@page/cart"), delay(ms)]).then(([m]) => m))
const Shop   = lazy(() => Promise.all([import("@page/shop"), delay(ms)]).then(([m]) => m))
const Me     = lazy(() => Promise.all([import("@page/me"), delay(ms)]).then(([m]) => m))
const Admin  = lazy(() => Promise.all([import("@page/admin"), delay(ms)]).then(([m]) => m))
const SignIn = lazy(() => Promise.all([import("@page/signin"), delay(ms)]).then(([m]) => m))
const SignUp = lazy(() => Promise.all([import("@page/signup"), delay(ms)]).then(([m]) => m))
const View   = lazy(() => Promise.all([import("@page/view"), delay(ms)]).then(([m]) => m))
const E404   = lazy(() => Promise.all([import("@error/E404"), delay(ms)]).then(([m]) => m))

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isPending, startTransition] = useTransition()
  const { dark, toggle } = useContext(ThemeCtx)
  const { count } = useCart()
  const nav = location.pathname
  const user = useAuth()
  
  const hideNav = ["/admin", "/signin", "/signup", "/view"].some(path => nav.startsWith(path))
  
  return (
    <Box sx={{
      flexDirection: "column",
      height: "100dvh",
      display: "flex",
      width: "100vw"
    }}>
      <AppBar position="sticky" elevation={0}>
        <PopupState varient="popover" popupId="menuPop">
          {(popupState) => (
            <>
              <Toolbar>
                <Typography onClick={() => navigate("/")} sx={{ flex: 1, fontSize: "1.5rem", fontWeight: 750 }}>ImABM</Typography>
                <IconButton {...bindTrigger(popupState)}>
                  <Avatar src={user?.photoURL}/>
                </IconButton>
              </Toolbar>
              <Menu
                {...bindMenu(popupState)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                {(!user)?(
                  <MenuItem onClick={() => { navigate("/signin"); popupState.close() }}>
                    <ListItemIcon><LoginIcon fontSize="small"/></ListItemIcon>
                    Sign In
                  </MenuItem>
                ):(
                  <MenuItem onClick={() => { signOut(getAuth()); popupState.close() }}>
                    <ListItemIcon><LogoutIcon fontSize="small"/></ListItemIcon>
                    Sign Out
                  </MenuItem>
                )}
                <MenuItem onClick={() => {popupState.close(), toggle()}}>
                  <ListItemIcon>{dark?<LightModeIcon/>:<DarkModeIcon/>}</ListItemIcon>
                  {dark?"Light Mode":"Dark Mode"}
                </MenuItem>
                
                {/* Will Delete This Item Later */}
                <MenuItem onClick={() => { navigate("/tp.html"); window.location.reload(); popupState.close() }}>
                  <ListItemIcon><SettingsIcon/></ListItemIcon>
                  Settings
                </MenuItem>
                
                
              </Menu>
            </>
          )}
        </PopupState>
      </AppBar>
      <Divider/>
      <Box sx={{ position: "relative", overflowY: "auto", flex: 1 }}>
        <Suspense fallback={<Backdrop open sx={{position: "absolute"}}><CircularProgress/></Backdrop>}>
          <Routes>
            <Route path="/" element={<Shop/>}/>
            <Route path="/cart" element={<Cart/>}/>
            <Route path="/me" element={<Me/>}/>
            <Route path="/admin" element={<Admin/>}/>
            <Route path="/signin" element={<SignIn/>}/>
            <Route path="/signup" element={<SignUp/>}/>
            <Route path="/view/:pid" element={<View/>}/>
            <Route path="*" element={<E404/>}/>
          </Routes>
        </Suspense>
        <Backdrop open={isPending} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, position: "absolute" }}><CircularProgress/></Backdrop>
      </Box>
      <Divider sx={{ display: hideNav? "none": "block" }}/>
      <BottomNavigation
        value={nav}
        sx={{ display: hideNav? "none": "flex" }}
        onChange={(e, v) => startTransition(() => navigate(v))}
      >
        <BottomNavigationAction label="Cart" value="/cart" icon={<Badge badgeContent={count} color="error" sx={{ "& .MuiBadge-badge": { transform: "scale(0.75) translate(50%, -25%)" } }}><ShoppingCartIcon/></Badge>}/>
        <BottomNavigationAction label="Shop" value="/" icon={<StorefrontIcon/>}/>
        <BottomNavigationAction label="Me" value="/me" icon={<AccountCircleIcon/>}/>
      </BottomNavigation>
    </Box>
  )
}