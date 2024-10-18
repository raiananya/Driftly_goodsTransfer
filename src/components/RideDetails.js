import { useContext } from "react";
import { realTimeDb } from "../firebase";
import { ref, set } from "firebase/database";
import Context from "../Context";
import { useNavigate } from "react-router-dom";

function RideDetail(props) {
  const { user, isDriver, currentRide } = props;
  const { setCurrentRide, setIsLoading } = useContext(Context);
  const navigate = useNavigate();

  const updateRide = (ride) => {
    setIsLoading(true);
    const rideRef = ref(realTimeDb, `rides/${ride.rideUuid}`);
    set(rideRef, ride)
      .then(() => {
        setIsLoading(false);
        setCurrentRide(null);
        localStorage.removeItem("currentRide");
        navigate("/");
      })
      .catch((error) => {
        console.error("Error updating ride: ", error);
        setIsLoading(false);
      });
  };

  const cancelRide = () => {
    const isCancel = window.confirm("Do you want to cancel this ride?");
    if (isCancel) {
      const updatedRide = { ...currentRide, status: -1 };
      updateRide(updatedRide);
      setCurrentRide(null);
      localStorage.removeItem("currentRide");
      navigate("/");
    }
  };

  const finishRide = () => {
    const isFinish = window.confirm("Do you want to finish this ride?");
    if (isFinish) {
      const updatedRide = { ...currentRide, status: 2 };
      updateRide(updatedRide);
      setCurrentRide(null);
      navigate("/");
    }
  };

  const talkToUser = () => {
    navigate("/chat");
  };

  return (
    <div className="ride-detail">
      <div className="ride-detail__user-avatar">
        <img src={user.avatar} alt={user.email} />
      </div>
      <p className="ride-detail__user-info">
        {user.email} - {user.phone}
      </p>
      <div className="ride-detail__actions">
        <p className="ride-detail__result-label">
          <span>From: </span>
          {currentRide.pickup && currentRide.pickup.label
            ? currentRide.pickup.label
            : ""}
        </p>
        <p className="ride-detail__result-label">
          <span>To: </span>
          {currentRide.destination && currentRide.destination.label
            ? currentRide.destination.label
            : ""}
        </p>
        <button className="ride-detail__btn" onClick={talkToUser}>
          {isDriver ? "Talk to User" : "Talk to Driver"}
        </button>
        <button className="ride-detail__btn" onClick={cancelRide}>
          Cancel the Ride
        </button>
        {isDriver && (
          <button className="ride-detail__btn" onClick={finishRide}>
            Finish the Ride
          </button>
        )}
      </div>
    </div>
  );
}

export default RideDetail;
