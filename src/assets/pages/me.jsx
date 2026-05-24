import { useNavigate } from "react-router-dom"
import { useAuth }     from "@/firebase"
import {
  useEffect,
  useState,
  useRef
} from "react"
import {
  CircularProgress,
  ButtonGroup,
  Typography,
  IconButton,
  Avatar,
  Button,
  Stack,
  Paper,
  Box
} from "@mui/material"

import HourglassBottomIcon from "@mui/icons-material/HourglassBottom"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import NewReleasesIcon from "@mui/icons-material/NewReleases"
import RateReviewIcon from "@mui/icons-material/RateReview"
import VerifiedIcon from "@mui/icons-material/Verified"
import GridViewIcon from "@mui/icons-material/GridView"
import PaymentIcon from "@mui/icons-material/Payment"
import ReviewsIcon from "@mui/icons-material/Reviews"
import EditIcon from "@mui/icons-material/Edit"

export default function me() {
  const navigate = useNavigate()
  const user = useAuth()
  const infoRef = useRef(null)
  const [size, setSize] = useState(0)
  
  useEffect(() => {
    if (user === null) {
      navigate("/signin")
      return
    }
    
    if (!infoRef.current) return
    const observer = new ResizeObserver(() => {
      setSize(infoRef.current.offsetHeight)
    })
    observer.observe(infoRef.current)
    setSize(infoRef.current.offsetHeight)
    return () => observer.disconnect()
  }, [user])
  
  if (user === undefined) return (
    <Box sx={{ height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <CircularProgress/>
    </Box>
  )
  if (user === null) return null
  
  return (
    <Box sx={{
      flexDirection: "column",
      display: "flex",
      gap: 2.5,
      p: 2.5,
      "& .MuiButtonGroup-root": {
        boxShadow: 3,
        "& .MuiButton-root": {
          flexDirection: "column",
          borderColor: "gray",
          color: "gray",
          "& .MuiSvgIcon-root": {
            fontSize: "1.75rem"
          }
        }
      }
    }}>
      <Paper elevation={3} sx={{ display: "flex", alignItems: "center", p: 1.25 }}>
        <Stack ref={infoRef} spacing={0.5} sx={{ flex: 1, justifyContent: "center" }}>
          <Typography variant="h6">Hi, {user?.displayName || "Unknown"}</Typography>
          <Typography variant="body2">{user.email}</Typography>
          <Stack direction="row">
            {user.emailVerified?(<VerifiedIcon/>):(<NewReleasesIcon/>)}
            <Typography sx={{ ml: 1 }}>{user.emailVerified?"Verified":"Unverified"}</Typography>
          </Stack>
        </Stack>
        <Stack sx={{ position: "relative" }}>
          <Avatar src={user.photoURL} sx={{ height: size, width: size, border: "0.5px solid grey" }}/>
          <IconButton sx={{ position: "absolute", backgroundColor: "background.paper", boxShadow: 2, bottom: 0, right: 0, p: 0.5, "&:hover, &:active, &:focus": { backgroundColor: "background.paper" }, "& .MuiSvgIcon-root": { fontSize: size/5 } }}><EditIcon/></IconButton>
        </Stack>
      </Paper>
      <ButtonGroup fullWidth>
        <Button>
          <ReviewsIcon/>
          <Typography variant="caption">Reviews</Typography>
        </Button>
        <Button>
          <GridViewIcon/>
          <Typography variant="caption">Orders</Typography>
        </Button>
      </ButtonGroup>
      <ButtonGroup fullWidth>
        <Button>
          <PaymentIcon/>
          <Typography variant="caption">To Pay</Typography>
        </Button>
        <Button>
          <HourglassBottomIcon></HourglassBottomIcon>
          <Typography variant="caption">To Ship</Typography>
        </Button>
        <Button>
          <RateReviewIcon/>
          <Typography variant="caption">To Review</Typography>
        </Button>
        <Button>
          <LocalShippingIcon/>
          <Typography variant="caption">Shipped</Typography>
        </Button>
      </ButtonGroup>
    </Box>
  )
}