import { BadgeCheck, HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";

function LowNavBar() {
  return (
    <div className="flex w-full justify-between  items-center gap-4 h-[80px]">
      <Link
        className="flex justify-center items-center  group w-1/2 h-full"
        to="/"
      >
        <HomeIcon className="group-hover:text-primary transition-all" />
      </Link>
      <Link
        className="flex items-center justify-center  group w-1/2 h-full"
        to="/verify"
      >
        <BadgeCheck className="group-hover:text-primary transition-all" />
      </Link>
    </div>
  );
}

export default LowNavBar;
