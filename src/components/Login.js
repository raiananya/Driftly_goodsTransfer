import { useRef, useContext } from "react";
import Context from "../Context";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { ref, query, orderByChild, equalTo, onValue } from "firebase/database";
import { realTimeDb } from "../firebase";
import validator from "validator";
import withModal from "./Modal";
import SignUp from "./SignUp";
import { useNavigate } from "react-router-dom";
import logo from "../logo.png";

function Login(props) {
  const { setUser, setIsLoading, cometChat } = useContext(Context);
  const { toggleModal } = props;
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();
  const auth = getAuth();

  const isUserCredentialsValid = (email, password) => {
    return validator.isEmail(email) && password;
  };

  const login = () => {
    console.log("login function triggered!");
    setIsLoading(true);
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    if (isUserCredentialsValid(email, password)) {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const userEmail = userCredential.user.email;
          const usersRef = query(
            ref(realTimeDb, "users"),
            orderByChild("email"),
            equalTo(userEmail)
          );

          onValue(usersRef, (snapshot) => {
            const val = snapshot.val();
            if (val) {
              const keys = Object.keys(val);
              const user = val[keys[0]];
              cometChat
                .login(user.id, `${process.env.REACT_APP_COMETCHAT_AUTH_KEY}`)
                .then(
                  () => {
                    localStorage.setItem("auth", JSON.stringify(user));
                    setUser(user);
                    setIsLoading(false);
                    navigate("/");
                  },
                  (error) => {
                    setIsLoading(false);
                    console.error("CometChat login failed : ", error);
                  }
                );
            }
          });
        })
        .catch((error) => {
          setIsLoading(false);
          console.error("Firebase sign-in error: ", error);
          alert(`Your user's name or password is not correct`);
        });
    } else {
      setIsLoading(false);
      alert(`Your user's name or password is not correct`);
    }
  };

  return (
    <div className="login__container">
      <div className="login__welcome">
        <div className="login__logo">
          <img src={logo} alt="Driftly" />
        </div>
        <p>Trusted Transfer!</p>
      </div>
      <div className="login__form-container">
        <div className="login__form">
          <input
            type="text"
            placeholder="Email or phone number"
            ref={emailRef}
          />
          <input type="password" placeholder="Password" ref={passwordRef} />
          <button
            className="login__submit-btn"
            onClick={() => {
              console.log("button clicked");
              login();
            }}
          >
            Login
          </button>
          <span className="login__forgot-password">Forgot Password</span>
          <span className="login_signup" onClick={() => toggleModal(true)}>
            Create new Account
          </span>
        </div>
      </div>
    </div>
  );
}

export default withModal(SignUp)(Login);
