import { Search } from "lucide-react";
import "../../styles/components/ui/SearchBar.css";

function SearchBar({ placeholder = "Search...", className = "", ...props }) {
  return (
    <div className={`search-bar ${className}`}>
      <Search size={18} />
      <input type="text" placeholder={placeholder} {...props} />
    </div>
  );
}

export default SearchBar;