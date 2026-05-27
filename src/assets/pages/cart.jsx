import {
  useEffect,
  useState,
  useRef
} from "react"
import {
  getFirestore,
  getDoc,
  doc
} from "firebase/firestore"
import {
  CircularProgress,
  ButtonGroup,
  Typography,
  Divider,
  Button,
  Stack,
  Box
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useCart } from "@/useCart"
import { app } from "@/firebase"

import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart'
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket"
import RemoveIcon from "@mui/icons-material/Remove"
import AddIcon from "@mui/icons-material/Add"

const TYPES = ["digital", "physical"]
const db    = getFirestore(app)
const THRESHOLD = 110

async function fetchProduct(pid) {
  for (const type of TYPES) {
    const snap = await getDoc(doc(db, "products", type, "items", pid))
    if (snap.exists()) return snap.data()
  }
  return null
}

function SwipeableCartItem({ pid, qty, product, loading, onRemove, onNavigate, onSetQty }) {
  const [offset,   setOffset]   = useState(0)
  const [removing, setRemoving] = useState(false)
  const startX   = useRef(null)
  const startY   = useRef(null)
  const dragging = useRef(false)
  const locked   = useRef(null)
  
  const handleTouchStart = (e) => {
    startX.current   = e.touches[0].clientX
    startY.current   = e.touches[0].clientY
    dragging.current = false
    locked.current   = null
  }
  
  const handleTouchMove = (e) => {
    if (startX.current === null) return
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current
    
    if (!locked.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      locked.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v"
    }
    if (locked.current !== "h") return
    
    dragging.current = true
    e.preventDefault()
    setOffset(dx)
  }
  
  const handleTouchEnd = () => {
    if (Math.abs(offset) >= THRESHOLD) {
      setRemoving(true)
      setOffset(offset > 0 ? window.innerWidth + 80 : -(window.innerWidth + 80))
      setTimeout(() => onRemove(pid), 380)
    } else {
      setOffset(0)
    }
    startX.current = null
    dragging.current = false
  }
  
  const progress = Math.min(Math.abs(offset) / THRESHOLD, 1)
  const isActive = Math.abs(offset) > 4
  
  return (
    <Box sx={{ borderRadius: 1, overflow: "hidden", maxHeight: removing ? 0 : 96, opacity: removing ? 0 : 1, transition: removing ? "max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease" : "none", boxShadow: 2.5 }}>
      <Box sx={{ position: "relative" }}>
        <Box sx={{ position: "absolute", inset: 0, background: `linear-gradient(to right, #e53935 ${progress * 100}%, transparent 100%)`, display: "flex", alignItems: "center", justifyContent: "flex-start", pl: 2, opacity: isActive && offset > 0 ? 1 : 0, pointerEvents: "none" }}>
          <RemoveShoppingCartIcon sx={{ color: "white", fontSize: 26, transform: `scale(${0.5 + progress * 0.5}) translateX(${(1 - progress) * -12}px)`, transition: dragging.current ? "none" : "transform 0.25s ease", opacity: progress }}/>
        </Box>
        <Box sx={{ position: "absolute", inset: 0, background: `linear-gradient(to left, #e53935 ${progress * 100}%, transparent 100%)`, display: "flex", alignItems: "center", justifyContent: "flex-end", pr: 2, opacity: isActive && offset < 0 ? 1 : 0, pointerEvents: "none" }}>
          <RemoveShoppingCartIcon sx={{ color: "white", fontSize: 26, transform: `scale(${0.5 + progress * 0.5}) translateX(${(1 - progress) * 12}px)`, transition: dragging.current ? "none" : "transform 0.25s ease", opacity: progress }}/>
        </Box>
        <Box onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} sx={{ borderRadius: 1, overflow: "hidden", display: "flex", alignItems: "center", height: 96, bgcolor: "background.paper", transform: `translateX(${offset}px)`, transition: dragging.current ? "none" : "transform 0.35s cubic-bezier(0.22,1,0.36,1)", willChange: "transform", userSelect: "none", touchAction: "pan-y" }}>
          <Box component="img" src={product?.imageUrl} onClick={() => onNavigate(pid)} sx={{ width: 96, height: 96, objectFit: "cover", flexShrink: 0, cursor: "pointer", display: "block" }}/>
          <Box sx={{ flex: 1, px: 1.5, minWidth: 0 }}>
            {loading && !product ? (<CircularProgress size={18}/>) : (
            <Stack direction="row">
              <Stack sx={{ flex: 1, minWidth: 0, "& .MuiTypography-root": { textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", display: "block" } }}>
                <Typography noWrap fontWeight={600} sx={{ cursor: "pointer", lineHeight: 1.3 }} onClick={() => onNavigate(pid)}>{product?.name || pid}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">{product?.category}</Typography>
                <Typography variant="body2" fontWeight={700} color="primary" lineHeight={1}>BDT {((product?.price || 0) * qty).toLocaleString()}</Typography>
              </Stack>
              <ButtonGroup orientation="vertical" size="small" variant="outlined" sx={{ flexShrink: 0, "& .MuiButtonGroup-grouped": { borderRadius: 0 }, "& .MuiButton-root.Mui-disabled": { borderColor: "primary.main", color: "primary.main" } }}>
                <Button onClick={() => onSetQty(pid, qty + 1)} sx={{ px: 0.75, minWidth: 30 }}>
                  <AddIcon sx={{ fontSize: 14 }}/>
                </Button>
                <Button disabled sx={{ px: 1, minWidth: 32, fontWeight: 700, lineHeight: 1 }}>
                  {qty}
                </Button>
                <Button onClick={() => onSetQty(pid, qty - 1)} sx={{ px: 0.75, minWidth: 30 }}>
                  { qty > 1 ? <RemoveIcon sx={{ fontSize: 14 }}/> : <RemoveShoppingCartIcon sx={{ fontSize: 14 }}/> }
                </Button>
              </ButtonGroup>
            </Stack>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function Cart() {
  const navigate = useNavigate()
  const { cartList, removeFromCart, setQty, count } = useCart()
  const [products, setProducts] = useState({})
  const [loading,  setLoading]  = useState(false)
  
  useEffect(() => {
    if (!cartList.length) return
    const missing = cartList.filter(({ pid }) => !products[pid]).map(({ pid }) => pid)
    if (!missing.length) return
    setLoading(true)
    Promise.all(
      missing.map(pid => fetchProduct(pid).then(p => [pid, p]))
    ).then(entries => {
      setProducts(prev => ({
        ...prev,
        ...Object.fromEntries(entries.filter(([, p]) => p))
      }))
      setLoading(false)
    })
  }, [cartList])
  
  const total      = cartList.reduce((sum, { pid, qty }) => sum + (products[pid]?.price || 0) * qty, 0)
  const sortedList = [...cartList].sort((a, b) => (products[b.pid]?.price || 0) - (products[a.pid]?.price || 0))
  
  if (!count) return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", gap: 2 }}>
      <ShoppingBasketIcon sx={{ fontSize: 64, color: "text.disabled" }}/>
      <Typography color="text.secondary">Your cart is empty</Typography>
      <Button variant="contained" disableElevation sx={{ borderRadius: 0 }} onClick={() => navigate("/")}>
        Browse Products
      </Button>
    </Box>
  )
  
  return (
    <Stack sx={{ height: "100%" }}>
      <Stack spacing={2.5} sx={{ flex: 1, p: 2.5 }}>
        {sortedList.map(({ pid, qty }) => ( <SwipeableCartItem key={pid} pid={pid} qty={qty} product={products[pid]} loading={loading} onRemove={removeFromCart} onNavigate={(pid) => navigate(`/view/${pid}`)} onSetQty={setQty}/> ))}
      </Stack>
      <Stack spacing={1} sx={{ position: "sticky", bottom: 0, p: 2.5, borderTop: 1, borderColor: "divider", bgcolor: "background.default" }}>
        <Typography color="text.secondary" variant="body2">{count} item{count !== 1 ? "s" : ""}</Typography>
        <Typography variant="h6" fontWeight={800} color="primary">BDT {total.toLocaleString()}</Typography>
        <Button disableElevation variant="contained" size="large" startIcon={<ShoppingBasketIcon/>}>Checkout</Button>
      </Stack>
    </Stack>
  )
}