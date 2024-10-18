import { useContext } from "react";
import Context from "../Context";
import { useNavigate } from "react-router-dom";
import logo from "../logo.png";

function Header() {
  const { user, setUser } = useContext(Context);
  const navigate = useNavigate();
  const logout = () => {
    const isLogout = window.confirm("Do you want to log out?");
    if (isLogout) {
      localStorage.removeItem("auth");
      setUser(null);
      navigate.push("/login");
    }
  };
  return (
    <div className="header">
      <div className="header__left">
        <img src={logo} alt="Driftly" />
        {user && (
          <div className="header__right">
            <img src={user.avatar} alt={user.email} />
            <span>Hello, {user.email}</span>
          </div>
        )}
      </div>
      <span className="header__logout" onClick={logout}>
        <span>Logout</span>
      </span>
    </div>
  );
}

export default Header;
