import {
  useEffect,
  useState,
  useMemo
} from "react"
import {
  getFirestore,
  collection,
  getDocs
} from "firebase/firestore"
import {
  FormControlLabel,
  SwipeableDrawer,
  CardActionArea,
  InputAdornment,
  ButtonGroup,
  CardActions,
  CardContent,
  FormControl,
  IconButton,
  Pagination,
  Typography,
  CardMedia,
  FormGroup,
  FormLabel,
  TextField,
  Checkbox,
  Divider,
  Button,
  Slider,
  Stack,
  Card,
  Chip,
  Grid,
  Box
} from "@mui/material"
import useScrollTrigger from "@mui/material/useScrollTrigger"
import { useNavigate } from "react-router-dom"
import Slide from "@mui/material/Slide"
import { useCart } from "@/useCart"
import { app } from "@/firebase"

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import SearchIcon from "@mui/icons-material/Search"
import RemoveIcon from "@mui/icons-material/Remove"
import TuneIcon from "@mui/icons-material/Tune"
import SortIcon from "@mui/icons-material/Sort"
import AddIcon from "@mui/icons-material/Add"

const db = getFirestore(app)
const TYPES = ["digital", "physical"]
const SORTS = [
  { value: "default", label: "Default" },
  { value: "low",     label: "Price: Low → High" },
  { value: "high",    label: "Price: High → Low" },
  { value: "name",    label: "Name A–Z" }
]

const PER_PAGE_OPTIONS = [20, 50, 100]
const savedSort    = localStorage.getItem("shop_sort")    || "default"
const savedPerPage = parseInt(localStorage.getItem("shop_perPage")) || PER_PAGE_OPTIONS[0]

export default function Shop() {
  const [products,        setProducts]        = useState([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState(null)
  const [search,          setSearch]          = useState("")
  const [sort,            setSort]            = useState(savedSort)
  const [perPage,         setPerPage]         = useState(savedPerPage)
  const [page,            setPage]            = useState(1)
  const [filterOpen,      setFilterOpen]      = useState(false)
  const [sortOpen,        setSortOpen]        = useState(false)
  const [showAllCats,     setShowAllCats]     = useState(false)
  const [scrollTarget,    setScrollTarget]    = useState(undefined)
  const [types,           setTypes]           = useState([])
  const [categories,      setCategories]      = useState([])
  const [priceRange,      setPriceRange]      = useState([0, 0])
  const [draftTypes,      setDraftTypes]      = useState([])
  const [draftCategories, setDraftCategories] = useState([])
  const [draftPrice,      setDraftPrice]      = useState([0, 0])
  
  const { addToCart, removeFromCart, inCart, getQty, setQty } = useCart()
  const navigate = useNavigate()
  
  useEffect(() => {
    async function load() {
      try {
        const all = []
        for (const type of TYPES) {
          const snap = await getDocs(collection(db, "products", type, "items"))
          snap.forEach(doc => {
            all.push({ ...doc.data(), id: doc.id })
          })
        }
        setProducts(all)
        const prices = all.map(p => p.price || 0)
        const min    = Math.floor(Math.min(...prices))
        const max    = Math.ceil(Math.max(...prices))
        setPriceRange([min, max])
        setDraftPrice([min, max])
      } catch(e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])
  
  const trigger = useScrollTrigger({ target: scrollTarget, threshold: 10 })
  const sortedCategories = useMemo(() => {
    const source = draftTypes.length === 0
      ? products
      : products.filter(p => draftTypes.includes(p.type))
    const cats = [...new Set(source.map(p => p.category).filter(Boolean))]
    return cats
      .map(cat => ({ cat, count: source.filter(p => p.category === cat).length }))
      .sort((a, b) => b.count - a.count)
  }, [products, draftTypes])
  const globalMin = products.length ? Math.floor(Math.min(...products.map(p => p.price || 0))) : 0
  const globalMax = products.length ? Math.ceil(Math.max(...products.map(p => p.price || 0)))  : 0
  const filtered = useMemo(() => products
    .filter(p => types.length      === 0 || types.includes(p.type))
    .filter(p => categories.length === 0 || categories.includes(p.category))
    .filter(p => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1])
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "low")  return a.price - b.price
      if (sort === "high") return b.price - a.price
      if (sort === "name") return a.name?.localeCompare(b.name)
      return 0
    }),
    [products, types, categories, priceRange, search, sort]
  )
  const totalPages = Math.ceil(filtered.length / perPage)
  const displayed  = filtered.slice((page - 1) * perPage, page * perPage)
  const toggleType = (type) => {
    setDraftTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
    setDraftCategories([])
  }
  const toggleCategory = (cat) => {
    setDraftCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }
  const handleSlider = (_, newVal) => {
    setDraftPrice(newVal)
  }
  const handlePriceInput = (index, raw) => {
    const val = parseFloat(raw)
    if (isNaN(val)) return
    const next = [...draftPrice]
    next[index] = val
    setDraftPrice(next)
  }
  const openFilter = () => {
    setDraftTypes([...types])
    setDraftCategories([...categories])
    setDraftPrice([...priceRange])
    setFilterOpen(true)
  }
  const applyFilters = () => {
    const validMin = Math.max(globalMin, Math.min(draftPrice[0], draftPrice[1]))
    const validMax = Math.min(globalMax, Math.max(draftPrice[0], draftPrice[1]))
    setTypes([...draftTypes])
    setCategories([...draftCategories])
    setPriceRange([validMin, validMax])
    setPage(1)
    setFilterOpen(false)
    setShowAllCats(false)
  }
  const resetFilters = () => {
    setDraftTypes([])
    setDraftCategories([])
    setDraftPrice([globalMin, globalMax])
    setTypes([])
    setCategories([])
    setPriceRange([globalMin, globalMax])
    setPage(1)
    setFilterOpen(false)
    setShowAllCats(false)
  }
  const handleSort = (val) => {
    setSort(val)
    setPage(1)
    localStorage.setItem("shop_sort", val)
    setSortOpen(false)
  }
  const handlePerPage = (val) => {
    setPerPage(val)
    setPage(1)
    localStorage.setItem("shop_perPage", val)
    setSortOpen(false)
  }
  const activeFilterCount = types.length + categories.length +
    (priceRange[0] !== globalMin || priceRange[1] !== globalMax ? 1 : 0)
  const visibleCats = showAllCats
    ? sortedCategories
    : sortedCategories.slice(0, 5)
  
  return (
    <Box
      ref={node => setScrollTarget(node ?? undefined)}
      sx={{ overflowY: "auto", height: "100%" }}
    >
      <Slide appear={false} direction="down" in={!trigger}>
        <Box sx={{
          position: "sticky", top: 0, zIndex: 100,
          backgroundColor: "background.paper",
          borderBottom: "1px solid", borderColor: "divider",
          display: "flex", alignItems: "center",
          px: 1, py: 1, gap: 0.5
        }}>
          <IconButton onClick={openFilter} sx={{ position: "relative" }}>
            <TuneIcon/>
            {activeFilterCount > 0 && (
              <Box sx={{
                position: "absolute", top: 6, right: 6,
                width: 8, height: 8, borderRadius: "50%",
                backgroundColor: "primary.main"
              }}/>
            )}
          </IconButton>
          <TextField
            size="small" fullWidth
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small"/>
                  </InputAdornment>
                )
              }
            }}
          />
          <IconButton onClick={() => setSortOpen(true)}>
            <SortIcon/>
          </IconButton>
        </Box>
      </Slide>
      <SwipeableDrawer
        anchor="left"
        open={filterOpen}
        onOpen={openFilter}
        onClose={() => { setFilterOpen(false); setShowAllCats(false) }}
        disableSwipeToOpen={false}
      >
        <Box sx={{ width: 280, display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{
            position: "sticky", top: 0, zIndex: 1,
            backgroundColor: "background.paper",
            px: 2.5, pt: 2.5, pb: 1.5,
            borderBottom: "1px solid", borderColor: "divider"
          }}>
            <Typography variant="h6" fontWeight={700}>Filter</Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", px: 2.5, py: 2 }}>
            <FormLabel>Price Range</FormLabel>
            <Box
              sx={{ mt: 2 }}
              onTouchStart={e => e.stopPropagation()}
              onTouchMove={e => e.stopPropagation()}
            >
              <Slider
                defaultValue={draftPrice}
                key={`${draftPrice[0]}-${draftPrice[1]}-${filterOpen}`}
                onChangeCommitted={handleSlider}
                min={globalMin}
                max={globalMax}
                valueLabelDisplay="auto"
                valueLabelFormat={v => `৳${v}`}
              />
              <Stack direction="row" spacing={1} mt={1}>
                <TextField
                  size="small" label="Min" type="number"
                  value={draftPrice[0]}
                  onChange={e => handlePriceInput(0, e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">৳</InputAdornment> } }}
                />
                <TextField
                  size="small" label="Max" type="number"
                  value={draftPrice[1]}
                  onChange={e => handlePriceInput(1, e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">৳</InputAdornment> } }}
                />
              </Stack>
            </Box>
            <Divider sx={{ my: 2 }}/>
            <FormControl component="fieldset" fullWidth>
              <FormLabel>Type</FormLabel>
              <FormGroup>
                {TYPES.map(t => (
                  <FormControlLabel
                    key={t}
                    control={<Checkbox checked={draftTypes.includes(t)} onChange={() => toggleType(t)} size="small"/>}
                    label={t.charAt(0).toUpperCase() + t.slice(1)}
                  />
                ))}
              </FormGroup>
            </FormControl>
            <Divider sx={{ my: 2 }}/>
            <FormControl component="fieldset" fullWidth>
              <FormLabel>
                Category
                {draftTypes.length > 0 && (
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75 }}>
                    ({draftTypes.join(", ")})
                  </Typography>
                )}
              </FormLabel>
              <FormGroup>
                {visibleCats.map(({ cat, count }) => (
                  <FormControlLabel
                    key={cat}
                    control={<Checkbox checked={draftCategories.includes(cat)} onChange={() => toggleCategory(cat)} size="small"/>}
                    label={`${cat} (${count})`}
                  />
                ))}
                {sortedCategories.length > 5 && !showAllCats && (
                  <Button
                    size="small"
                    sx={{ alignSelf: "flex-start", mt: 0.5, textTransform: "none" }}
                    onClick={() => setShowAllCats(true)}
                  >
                    Show {sortedCategories.length - 5} more
                  </Button>
                )}
              </FormGroup>
            </FormControl>
          </Box>
          <Box sx={{
            position: "sticky", bottom: 0,
            backgroundColor: "background.paper",
            px: 2.5, py: 2,
            borderTop: "1px solid", borderColor: "divider"
          }}>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" disableElevation onClick={applyFilters}>
                Apply
              </Button>
              <Button fullWidth variant="outlined" onClick={resetFilters}>
                Reset
              </Button>
            </Stack>
          </Box>
        </Box>
      </SwipeableDrawer>
      <SwipeableDrawer
        anchor="right"
        open={sortOpen}
        onOpen={() => setSortOpen(true)}
        onClose={() => setSortOpen(false)}
        disableSwipeToOpen={false}
      >
        <Box sx={{ width: 260, display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{
            position: "sticky", top: 0, zIndex: 1,
            backgroundColor: "background.paper",
            px: 2.5, pt: 2.5, pb: 1.5,
            borderBottom: "1px solid", borderColor: "divider"
          }}>
            <Typography variant="h6" fontWeight={700}>Sort</Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", px: 2.5, py: 2 }}>
            <FormLabel>Sort By</FormLabel>
            <Stack spacing={1} mt={1}>
              {SORTS.map(s => (
                <Chip
                  key={s.value}
                  label={s.label}
                  onClick={() => handleSort(s.value)}
                  color={sort === s.value ? "primary" : "default"}
                  variant={sort === s.value ? "filled" : "outlined"}
                  sx={{ justifyContent: "flex-start", px: 1 }}
                />
              ))}
            </Stack>
            <Divider sx={{ my: 2 }}/>
            <FormLabel>Items Per Page</FormLabel>
            <Stack spacing={1} mt={1}>
              {PER_PAGE_OPTIONS.map(n => (
                <Chip
                  key={n}
                  label={`${n} items`}
                  onClick={() => handlePerPage(n)}
                  color={perPage === n ? "primary" : "default"}
                  variant={perPage === n ? "filled" : "outlined"}
                  sx={{ justifyContent: "flex-start", px: 1 }}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      </SwipeableDrawer>
      {error && <Typography color="error" sx={{ p: 2.5 }}>{error}</Typography>}
      <Grid container spacing={2} sx={{ p: 2 }}>
        {displayed.map(product => {
          const alreadyInCart = inCart(product.id)
          return (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={product.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardActionArea onClick={() => navigate(`/view/${product.id}`)}>
                  <CardMedia component="img" image={product.imageUrl} sx={{ aspectRatio: 1, objectFit: "cover" }}/>
                  <CardContent sx={{ pb: 0 }}>
                    <Typography noWrap fontWeight={600}>{product.name}</Typography>
                    <Typography noWrap variant="body2" color="text.secondary">{product.description}</Typography>
                    <Typography variant="caption" color="text.secondary">{product.category}</Typography>
                    <Typography variant="body2" fontWeight={600}>৳{product.price}</Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ pt: 0.5, mt: "auto" }}>
                  {!alreadyInCart ? (
                    <Button fullWidth variant="contained" disableElevation size="small" onClick={() => addToCart(product.id)}>
                      <AddShoppingCartIcon fontSize="small"/>
                    </Button>
                  ) : (
                    <ButtonGroup fullWidth size="small" sx={{ "& .MuiButton-root.Mui-disabled": { borderColor: "primary.main", color: "primary.main" } }}>
                      <Button onClick={() => setQty(product.id, getQty(product.id) + 1)}><AddIcon fontSize="small"/></Button>
                      <Button disabled sx={{ lineHeight: 1 }}>{getQty(product.id)}</Button>
                      <Button onClick={() => setQty(product.id, getQty(product.id) - 1)}><RemoveIcon fontSize="small"/></Button>
                    </ButtonGroup>
                  )}
                </CardActions>
              </Card>
            </Grid>
          )
        })}
        {!loading && filtered.length === 0 && (
          <Grid size={12}>
            <Typography sx={{ textAlign: "center", color: "text.secondary", mt: 5 }}>
              No products found
            </Typography>
          </Grid>
        )}
      </Grid>
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, val) => { setPage(val); scrollTarget?.scrollTo({ top: 0, behavior: "smooth" }) }}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  )
}