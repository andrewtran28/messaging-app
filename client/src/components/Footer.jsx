import { Link } from "react-router-dom";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer>
      <span>
        © 2025 <Link to="https://github.com/andrewtran28/blog-api">Buhlog</Link> by{" "}
        <Link to="https://andrewtran-developer.netlify.app/home">minglee</Link>. All rights reserved.
      </span>
    </footer>
  );
}

export default Footer;
