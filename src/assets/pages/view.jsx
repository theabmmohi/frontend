import {
  useEffect,
  useState
} from "react"
import {
  useNavigate,
  useParams
} from "react-router-dom"
import {
  getFirestore,
  getDoc,
  doc
} from "firebase/firestore"
import {
  CircularProgress,
  ButtonGroup,
  IconButton,
  Typography,
  Divider,
  Button,
  Rating,
  Stack,
  Chip,
  Box
} from "@mui/material"
import { useCart } from "@/useCart"
import { app } from "@/firebase"

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket"
import BlockRoundedIcon from '@mui/icons-material/BlockRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import RemoveIcon from "@mui/icons-material/Remove"
import AddIcon from "@mui/icons-material/Add"

const TYPES = ["digital", "physical"]
const db = getFirestore(app)

export default function View() {
  const { pid }    = useParams()
  const navigate   = useNavigate()
  const { addToCart, removeFromCart, inCart, setQty, getQty } = useCart()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  
  useEffect(() => {
    async function load() {
      try {
        for (const type of TYPES) {
          const snap = await getDoc(doc(db, "products", type, "items", pid))
          if (snap.exists()) {
            setProduct(snap.data())
            return
          }
        }
        setError("Product not found")
      } catch(e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [pid])
  
  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <CircularProgress/>
    </Box>
  )
  
  if (error) return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ backgroundColor: "background.paper", position: "sticky", display: "flex", alignItems: "center", borderBottom: "1px solid", borderColor: "divider", zIndex: 999, top: 0, pr: 2.5 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ m: 1 }}>
          <ArrowBackIcon/>
        </IconButton>
        <Typography sx={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1, pr: 2 }}>Product Not Found</Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 2, mb: 25 }}>
        <BlockRoundedIcon sx={{ color: "text.secondary", fontSize: 80 }}/>
        <Typography sx={{ color: "text.secondary" }}>Product Not Found</Typography>
      </Box>
    </Box>
  )
  
  const alreadyInCart = inCart(pid)
  
  return (
    <Box>
      <Box sx={{ backgroundColor: "background.paper", position: "sticky", display: "flex", alignItems: "center", borderBottom: "1px solid", borderColor: "divider", zIndex: 999, top: 0, pr: 2.5 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ m: 1 }}>
          <ArrowBackIcon/>
        </IconButton>
        <Typography sx={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1, pr: 2 }}>{product.name}</Typography>
        <Typography></Typography>
      </Box>
      
      <Box id="Overview">
        <Box component="img" src={product.imageUrl} alt={product.name} sx={{ width: "100%", aspectRatio: 1, objectFit: "cover" }}/>
        <Stack sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={700}>{product.name}</Typography>
          <Typography variant="h5" fontWeight={700} sx={{ whiteSpace: "nowrap" }}>BDT {product.price}</Typography>
          <Stack direction="row" sx={{ alignItems: "center" }}>
            <Rating readOnly size="small" value={3.6} precision={0.1} icon={<StarRoundedIcon fontSize="inherit"/>} emptyIcon={<StarRoundedIcon fontSize="inherit"/>}/>
            <Typography sx={{ color: "text.secondary" }}>&nbsp;|&nbsp;{"1000"}+ Sold</Typography>
          </Stack>
        </Stack>
      </Box>
      <Divider/>
      <Box id="Reviews" sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Reviews</Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam numquam odio exercitationem. Quidem est, commodi rem exercitationem reiciendis quos id. Accusamus non quisquam culpa rem dicta aut! Itaque nesciunt vero consequatur beatae atque dolorem deleniti non debitis et, dolores repudiandae sunt distinctio odit veritatis adipisci officiis aspernatur voluptatem, quidem nostrum illo! Ducimus tenetur labore eaque, veniam aliquam sapiente soluta ad omnis officia dolore esse possimus illum itaque exercitationem quaerat voluptatem repellendus perspiciatis tempora, dignissimos, neque alias aut? Quam odit ipsa nisi veniam autem non quas vero nam sapiente dolores dolorem praesentium suscipit reiciendis quidem ut perspiciatis, fuga officia, ab eius repellat voluptatibus fugit perferendis iure. Molestias atque illum nobis veniam asperiores sequi corporis doloribus iusto optio suscipit id, enim eius placeat quidem cupiditate provident ipsum aliquid exercitationem distinctio nam nesciunt est perferendis minima. Quidem saepe nobis eum nesciunt nihil minus sed impedit maiores blanditiis enim labore, mollitia adipisci. Necessitatibus nostrum sequi sapiente illum, iure officia quis omnis cum similique cupiditate accusantium delectus earum doloremque odio impedit minus voluptas nihil reprehenderit ipsum. Voluptates iusto, nihil quidem iure voluptatem reprehenderit non dolore eius culpa sit voluptatibus minima vero deserunt doloribus quas. Reprehenderit beatae ab quos expedita, iure aut voluptatem. Delectus ipsum mollitia est neque commodi hic, ea laborum doloremque consequatur modi voluptas recusandae dolor necessitatibus, velit doloribus. Atque minima quidem temporibus numquam eligendi magni ipsam ut pariatur distinctio praesentium, incidunt delectus dolores hic quo fuga odio libero dolorem facilis nihil aliquam. Repudiandae eveniet cupiditate in ullam eum eligendi asperiores reiciendis quibusdam hic.
        </Typography>
      </Box>
      <Divider/>
      <Box id="QNA" sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Q&A</Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum obcaecati autem a, harum consequuntur quia hic omnis explicabo aut alias laudantium eos dolor consequatur debitis. Consectetur dolore corrupti rem? Odit vero distinctio enim nobis temporibus quis laboriosam corporis voluptatum tempore consequuntur maxime nam rerum asperiores nesciunt amet, impedit esse eius explicabo, magni architecto necessitatibus! Nobis ducimus, quaerat inventore in qui ad odio, iste ipsum molestias non dolores numquam quidem est! Exercitationem fugit expedita explicabo nesciunt necessitatibus quos sed eius omnis nihil officia, provident assumenda suscipit vitae soluta perspiciatis, blanditiis fugiat voluptatum inventore quasi iste nemo consequuntur id magni nulla. Libero placeat assumenda incidunt ipsa repudiandae autem ea magnam eveniet aliquid! Porro similique ullam iure, eius ipsum officiis quod nesciunt fugiat voluptate ad quis suscipit nihil, fugit eum, aspernatur nostrum repellat accusantium. Nam possimus error necessitatibus quibusdam quisquam inventore sequi iusto natus esse? Natus aperiam possimus ut ducimus amet nemo necessitatibus, repudiandae aut architecto porro inventore, impedit dolorum rerum magnam. Rem, aliquam numquam voluptate ipsam culpa beatae aspernatur dolore dolores velit exercitationem adipisci ducimus atque veniam non eius maiores, quas fugiat? Consectetur, atque qui, rem fuga, possimus earum laboriosam sit cupiditate esse sed unde quo inventore repellendus odit non veritatis necessitatibus obcaecati? Sequi reiciendis in minima deserunt blanditiis ipsum ab quae repellat, iure, consequuntur aut odio deleniti nam expedita! Itaque, consequuntur culpa? Quae corporis vitae in, explicabo laborum quos iure repellendus itaque veniam illo eos reprehenderit. Labore quisquam assumenda eaque dolorum architecto ipsa, veniam, totam ducimus repellendus vel sequi praesentium voluptates.
        </Typography>
      </Box>
      <Divider/>
      <Box id="Description" sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Description</Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", textAlign: "justify", color: "text.secondary" }}>{product.description || "No Description Available"}</Typography>
      </Box>
      <Divider/>
      <Box id="Details" sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Details</Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", textAlign: "justify", color: "text.secondary" }}>{product.details || "No Details Available"}</Typography>
      </Box>
      
      <Box sx={{ backgroundColor: "background.paper", position: "sticky", display: "flex", alignItems: "center", borderTop: "1px solid", borderColor: "divider", zIndex: 999, bottom: 0, gap: 2, p: 2 }}>
        {alreadyInCart ? (
          <ButtonGroup fullWidth sx={{ "& .MuiButton-root.Mui-disabled": { borderColor: "primary.main", color: "primary.main" } }}>
            <Button onClick={() => setQty(pid, getQty(pid) + 1)}><AddIcon/></Button>
            <Button disabled sx={{ lineHeight: 1 }}>{getQty(pid)}</Button>
            <Button onClick={() => setQty(pid, getQty(pid) - 1)}><RemoveIcon/></Button>
          </ButtonGroup>
        ) : (
          <Button fullWidth disableElevation variant="contained"
            startIcon={<AddShoppingCartIcon/>}
            onClick={() => addToCart(pid)}
          >Add to Cart</Button>
        )}
        <Button fullWidth variant="outlined" startIcon={<ShoppingBasketIcon/>}>Buy Now</Button>
      </Box>
    </Box>
  )
}