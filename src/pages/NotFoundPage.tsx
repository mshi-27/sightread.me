import { Link } from "react-router-dom";
import "./HomePage.css";

export default function NotFoundPage() {
  // Link provides client-side routing with no refresh
  return (
    <div className={"container"}>
      <h1 className="title">
        <span className="brand-name">sightread</span>
        <img
          src="/images/music-images/sightreadmedotpurple.svg"
          className="logo-dot"
        ></img>
        <span className="brand-extension">me</span>
      </h1>
      <div className="not-found-content">
        <p className="">Page not found.</p>
        <Link to="/" className="home-link">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
