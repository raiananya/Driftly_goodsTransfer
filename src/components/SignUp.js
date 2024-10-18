import { useRef, useContext } from "react";
import Context from "../Context";
import validator from "validator";
import { auth, realTimeDb } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

function SignUp(props) {
  const { toggleModal } = props;

  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const roleRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const { cometChat, setIsLoading } = useContext(Context);
  const navigate = useNavigate();

  const driverRole = "driver";
  const userRole = "user";

  const generateAvatar = () => {
    const avatars = [
      "https://data-us.cometchat.io/assets/images/avatars/captainamerica.png",
      "https://data-us.cometchat.io/assets/images/avatars/cyclops.png",
      "https://data-us.cometchat.io/assets/images/avatars/ironman.png",
      "https://data-us.cometchat.io/assets/images/avatars/spiderman.png",
      "https://data-us.cometchat.io/assets/images/avatars/wolverine.png",
    ];
    const avatarPosition = Math.floor(Math.random() * avatars.length);
    return avatars[avatarPosition];
  };

  const isSignupValid = ({ email, phone, role, password, confirmPassword }) => {
    if (!validator.isEmail(email)) {
      alert("Please input your email");
      return false;
    }
    if (!validator.isMobilePhone(phone)) {
      alert("Please input your phone number");
      return false;
    }
    if (validator.isEmpty(role)) {
      alert("Please input your role");
      return false;
    }
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 6 })
    ) {
      alert(
        "Please input your password. You password must have at least 6 characters"
      );
      return false;
    }
    if (validator.isEmpty(confirmPassword)) {
      alert("Please input your confirm password");
      return false;
    }
    if (password !== confirmPassword) {
      alert("Confirm password and password must be the same");
      return false;
    }
    return true;
  };

  const signup = async () => {
    const email = emailRef.current.value;
    const phone = phoneRef.current.value;
    const role = roleRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;

    if (isSignupValid({ email, phone, role, password, confirmPassword })) {
      setIsLoading(true);
      const userUuid = uuidv4();
      const userAvatar = generateAvatar();
      try {
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (userCredentials) {
          await set(ref(realTimeDb, `users/${userUuid}`), {
            id: userUuid,
            email,
            phone,
            role,
            avatar: userAvatar,
          });
          alert(
            `${userCredentials.user.email} was created successfully! Please sign in with your created account`
          );
          const authKey = `${process.env.REACT_APP_COMETCHAT_AUTH_KEY}`;
          const user = new cometChat.User(userUuid);
          user.setName(email);
          user.setAvatar(userAvatar);

          await cometChat.createUser(user, authKey);
          setIsLoading(false);
          toggleModal(false);
          navigate("/");
        }
      } catch (error) {
        console.log(error);
        const errorMessage = error.message;
        console.log(errorMessage);
        setIsLoading(false);
        alert(
          `Cannot create your account, ${email} might be existed, please try again!`
        );
      }
    }
  };

  return (
    <div className="signup">
      <div className="signup__content">
        <div className="signup__container">
          <div className="signup__title">Sign Up</div>
          <div className="signup__close">
            <img
              alt="close"
              onClick={() => toggleModal(false)}
              src="https://www.freeiconspng.com/thumbs/close-icon/close-icon-29.png"
              style={{
                width: "20px",
                height: "20px",
                position: "absolute",
                top: "10px",
                right: "10px",
                cursor: "pointer",
              }}
            />
          </div>
        </div>
        <div className="signup__form">
          <input type="text" placeholder="Email" ref={emailRef} />
          <input type="text" placeholder="Phone" ref={phoneRef} />
          <select ref={roleRef} defaultValue={userRole}>
            <option value={userRole}>User</option>
            <option value={driverRole}>Driver</option>
          </select>
          <input type="password" placeholder="Password" ref={passwordRef} />
          <input
            type="password"
            placeholder="Confirm Password"
            ref={confirmPasswordRef}
          />
          <button className="signup__btn" onClick={signup}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
