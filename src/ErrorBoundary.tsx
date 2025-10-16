import React, { ErrorInfo } from "react";
import "./pages/HomePage.css";
import { Link } from "react-router-dom";
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
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
            <p className="">Sorry, An Error Occured.</p>
            <Link to="/" className="home-link">
              Return to Home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
