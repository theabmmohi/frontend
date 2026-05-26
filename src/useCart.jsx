import {
  useCallback,
  useEffect,
  useState,
  useRef
} from "react"
import {
  getFirestore,
  deleteField,
  onSnapshot,
  increment,
  updateDoc,
  setDoc,
  doc
} from "firebase/firestore"
import { useAuth } from "@/firebase"
import { app } from "@/firebase"

const raw = JSON.parse(localStorage.getItem("shop_guestCart") || "{}")
let guestCart = Array.isArray(raw) ? Object.fromEntries(raw.map(pid => [pid, 1])) : raw
const listeners = new Set()
const db = getFirestore(app)
const notifyListeners = () => {
  localStorage.setItem("shop_guestCart", JSON.stringify(guestCart))
  listeners.forEach(fn => fn({ ...guestCart }))
}

export function useCart() {
  const user    = useAuth()
  const userRef = useRef(user)
  const [cart, setCart] = useState({})
  useEffect(() => { userRef.current = user }, [user])
  useEffect(() => {
    if (user === undefined) return
    if (!user) {
      setCart({ ...guestCart })
      const fn = (c) => setCart(c)
      listeners.add(fn)
      const onStorage = (e) => {
        if (e.key === "shop_guestCart") {
          const parsed = JSON.parse(e.newValue || "{}")
          guestCart = Array.isArray(parsed)
            ? Object.fromEntries(parsed.map(pid => [pid, 1]))
            : parsed
          fn({ ...guestCart })
        }
      }
      window.addEventListener("storage", onStorage)
      return () => {
        listeners.delete(fn)
        window.removeEventListener("storage", onStorage)
      }
    }
    const toMigrate = { ...guestCart }
    guestCart = {}
    notifyListeners()
    const ref = doc(db, "users", user.uid, "cart", "items")
    if (Object.keys(toMigrate).length > 0) {
      const updates = Object.fromEntries(
        Object.entries(toMigrate).map(([pid, qty]) => [`items.${pid}`, increment(qty)])
      )
      updateDoc(ref, updates).catch(() =>
        setDoc(ref, { items: toMigrate })
      )
    }
    const unsub = onSnapshot(ref, snap => {
      setCart(snap.exists() ? (snap.data().items || {}) : {})
    })
    return () => unsub()
  }, [user])
  const addToCart = useCallback(async (pid) => {
    const u = userRef.current
    if (!u) {
      guestCart = { ...guestCart, [pid]: (guestCart[pid] || 0) + 1 }
      notifyListeners()
      return
    }
    const ref = doc(db, "users", u.uid, "cart", "items")
    await updateDoc(ref, { [`items.${pid}`]: increment(1) }).catch(() =>
      setDoc(ref, { items: { [pid]: 1 } })
    )
  }, [])
  const setQty = useCallback(async (pid, qty) => {
    const u = userRef.current
    if (qty <= 0) {
      if (!u) {
        const { [pid]: _, ...rest } = guestCart
        guestCart = rest
        notifyListeners()
        return
      }
      const ref = doc(db, "users", u.uid, "cart", "items")
      await updateDoc(ref, { [`items.${pid}`]: deleteField() })
      return
    }
    if (!u) {
      guestCart = { ...guestCart, [pid]: qty }
      notifyListeners()
      return
    }
    const ref = doc(db, "users", u.uid, "cart", "items")
    await setDoc(ref, { items: { [pid]: qty } }, { merge: true })
  }, [])
  const removeFromCart = useCallback(async (pid) => {
    const u = userRef.current
    if (!u) {
      const { [pid]: _, ...rest } = guestCart
      guestCart = rest
      notifyListeners()
      return
    }
    const ref = doc(db, "users", u.uid, "cart", "items")
    await updateDoc(ref, { [`items.${pid}`]: deleteField() })
  }, [])
  const inCart  = useCallback((pid) => pid in cart && cart[pid] > 0, [cart])
  const getQty  = useCallback((pid) => cart[pid] || 0, [cart])
  const cartList = Object.entries(cart).map(([pid, qty]) => ({ pid, qty }))
  const count   = Object.values(cart).reduce((sum, q) => sum + q, 0)
  return { cart, cartList, addToCart, removeFromCart, setQty, inCart, getQty, count }
}