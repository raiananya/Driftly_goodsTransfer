import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import Loading from "./components/Loading";
import Chat from "./components/Chat";
import PrivateRoute from "./components/PrivateRoute";
import "./index.css";
import Context from "./Context";
import { realTimeDb } from "./firebase";
import { ref, onValue, off } from "firebase/database";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [cometChat, setCometChat] = useState(null);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);
  const [currentRide, setCurrentRide] = useState(null);
  const lookingForDriverTime = 30000;

  useEffect(() => {
    initAuthUser();
    initCometChat();
    initCurrentRide();
  }, []);

  useEffect(() => {
    if (rideRequest) {
      const lookingForDriverTimeOut = setTimeout(() => {
        alert(
          "Cannot find your driver, please re-enter ypur pickup your location and try again!"
        );
        setRideRequest(null);
        setIsLoading(false);
      }, lookingForDriverTime);
      setIsLoading(true);

      const createdRideRef = ref(realTimeDb, `rides/${rideRequest.rideUuid}`);
      onValue(createdRideRef, (snapshot) => {
        const updatedRide = snapshot.val();
        if (
          updatedRide &&
          updatedRide.rideUuid === rideRequest.rideUuid &&
          updatedRide.driver
        ) {
          setIsLoading(false);
          localStorage.setItem("currentItem", JSON.stringify(updatedRide));
          setCurrentRide(() => updatedRide);
        }
      });
      return () => {
        clearTimeout(lookingForDriverTimeOut);
        off(createdRideRef);
      };
    }
  }, [rideRequest]);

  useEffect(() => {
    if (currentRide) {
      const currentRideref = ref(realTimeDb, `rides/${currentRide.rideUuid}`);
      onValue(currentRideref, (snapshot) => {
        const updatedRide = snapshot.val();
        if (
          updatedRide &&
          updatedRide.rideUuid === currentRide.rideUuid &&
          updatedRide.driver &&
          (updatedRide.status === -1 || updatedRide.status === 2)
        ) {
          localStorage.removeItem("currentRide");
          setCurrentRide(null);
          window.location.reload();
        }
      });
    }
  }, [currentRide]);

  const initCurrentRide = () => {
    const currentRide = localStorage.getItem("currentItem");
    if (currentRide) {
      setCurrentRide(() => JSON.parse(currentRide));
    }
  };

  const initAuthUser = () => {
    const authenticatedUser = localStorage.getItem("auth");
    if (authenticatedUser) {
      setUser(JSON.parse(authenticatedUser));
    }
  };

  const initCometChat = async () => {
    const { CometChat } = await import("@cometchat-pro/chat");
    const appId = `${process.env.REACT_APP_COMETCHAT_APP_ID}`;
    const region = `${process.env.REACT_APP_COMETCHAT_REGION}`;
    const appSetting = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(region)
      .build();
    CometChat.init(appId, appSetting).then(
      () => {
        setCometChat(() => CometChat);
      },
      (error) => {}
    );
  };

  return (
    <Context.Provider
      value={{
        isLoading,
        setIsLoading,
        user,
        setUser,
        cometChat,
        selectedFrom,
        setSelectedFrom,
        selectedTo,
        setSelectedTo,
        rideRequest,
        setRideRequest,
        currentRide,
        setCurrentRide,
      }}
    >
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
      {isLoading && <Loading />}
    </Context.Provider>
  );
}

export default App;
