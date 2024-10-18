import { useContext } from "react";
import { realTimeDb } from "../firebase";
import { ref, set } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import Context from "../Context";

function RequestRide({ toggleModal }) {
  const { user, selectedFrom, selectedTo, setRideRequest, setIsLoading } =
    useContext(Context);

  const requestRide = () => {
    if (user && selectedFrom && selectedTo) {
      toggleModal(false);
      setIsLoading(true);
      const rideUuid = uuidv4();
      const ride = {
        rideUuid,
        requestor: user,
        pickup: selectedFrom,
        destination: selectedTo,
        status: 0,
      };
      const rideRef = ref(realTimeDb, `rides/${rideUuid}`);
      set(rideRef, ride)
        .then(() => {
          setRideRequest(ride);
          setIsLoading(false);
          alert("Ride requested successfully!");
        })
        .catch((error) => {
          console.error("Error setting ride request: ", error);
          setIsLoading(false);
          alert("Failed to request ride. Please try again!");
        });
    } else {
      alert("Please select a pickup and destination.");
    }
  };

  return (
    <div className="request-ride">
      <div className="request-ride__content">
        <div className="request-ride__container">
          <div className="request-ride__title">Requesting a Ride</div>
          <div className="request-ride__close">
            <img
              alt="close"
              onClick={() => toggleModal(false)}
              src="https://static.xx.fbcdn.net/rsrc.php/v3/y2/r/__geKiQnSG-.png"
            />
          </div>
        </div>
        <div className="request-ride__subtitle">
          <p>
            You entered the pickup location successfully. Do you want to request
            a ride now?
          </p>
        </div>
        <div className="request-ride__form">
          <button
            className="request-ride__btn request-ride__change-btn"
            onClick={() => toggleModal(false)}
          >
            Change
          </button>
          <button className="request-ride__btn" onClick={requestRide}>
            Requesting a ride now
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestRide;
