import { Typography } from "@mui/material";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

export const Home = () => (
  <>
  <Helmet>
    <title>Meiro Frontend task</title>
  </Helmet>
    <Typography variant="h1">Home</Typography>
    <Link to='attributes'><Typography variant='h2'>Attributes</Typography></Link>
  </>
);
