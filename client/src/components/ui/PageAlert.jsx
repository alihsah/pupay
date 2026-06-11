import "../../styles/components/ui/PageAlert.css";

function PageAlert({ message, type = "success" }) {
  if (!message) return null;

  return <p className={`page-alert ${type}`}>{message}</p>;
}

export default PageAlert;