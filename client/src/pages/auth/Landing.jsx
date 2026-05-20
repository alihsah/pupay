import { Link } from "react-router-dom";

function Landing() {
  return (
    <main className="page-container">
      <h1>Welcome to PUPay</h1>

      <Link to="/admin/dashboard">Admin Dashboard</Link>
      <br />
      <Link to="/student/dashboard">Student Dashboard</Link>
    </main>
  );
}

export default Landing;