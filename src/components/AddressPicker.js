import { useContext, useEffect, useRef, useState } from "react";
import Context from "../Context";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import withModal from "./Modal";
import RequestRide from "./RequestRide";

function AddressPicker(props) {
  const [isFrom, setIsfrom] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [weight, setWeight] = useState(0);
  const [cost, setCost] = useState(0);

  const {
    selectedFrom,
    setSelectedFrom,
    selectedTo,
    setSelectedTo,
    toggleModal,
  } = useContext(Context);

  const provider = useRef();
  const searchRef = useRef();

  useEffect(() => {
    initProvider();
  }, []);

  const initProvider = () => {
    provider.current = new OpenStreetMapProvider({
      params: {
        "accept-language": "en",
        countrycode: "us",
      },
    });
  };

  const onInputChanged = (e) => {
    const input = e.target.value;
    provider.current.search({ query: input }).then((results) => {
      setSearchResults(() => results);
    });
  };

  const onLocationSelected = (selectedLocation) => {
    if (
      selectedLocation &&
      selectedLocation.label &&
      selectedLocation.x &&
      selectedLocation.y
    ) {
      if (isFrom) {
        setSelectedFrom(() => selectedLocation);
        setIsfrom(() => false);
      } else {
        setSelectedTo(() => selectedLocation);
        setIsfrom(() => true);
      }
      setSearchResults([]);
      searchRef.current.value = "";
    }
  };

  const calculateCost = (distance, weight) => {
    const costPerKm = 15;
    const costPerKg = 5;
    return distance * costPerKm + weight * costPerKg;
  };

  const getDistance = (from, to) => {
    if (!from || !to) return 0;

    const R = 6371;
    const dLat = (to.y - from.y) * (Math.PI / 180);
    const dLon = (to.x - from.x) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(from.y * (Math.PI / 180)) *
        Math.cos(to.y * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleWeightInput = (e) => {
    const enteredWeight = Number(e.target.value);
    setWeight(enteredWeight);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && selectedFrom && selectedTo && weight > 0) {
      const distance = getDistance(selectedFrom, selectedTo);
      const totalCost = calculateCost(distance, weight);
      setCost(totalCost.toFixed(2));
    }
  };

  const requestRide = () => {
    props.toggleModal(true);
  };

  return (
    <div className="address">
      <div className="address__title">
        <div className="address__title-container">
          <p className="address__title-from" onClick={() => setIsfrom(true)}>
            {selectedFrom && selectedFrom.label
              ? selectedFrom.label
              : "Pickup location ?"}
          </p>
          <p className="address__title-to" onClick={() => setIsfrom(false)}>
            {selectedTo && selectedTo.label
              ? selectedTo.label
              : "Destination ?"}
          </p>
        </div>
      </div>
      <div className="search">
        <input
          className="search__input"
          type="text"
          placeholder={
            isFrom ? "Add a pickup location" : "Enter your destination"
          }
          onChange={onInputChanged}
          ref={searchRef}
        />
        <div className="search__result">
          {searchResults &&
            searchResults.length !== 0 &&
            searchResults.map((result, index) => (
              <div
                className="search__result-item"
                key={index}
                onClick={() => onLocationSelected(result)}
              >
                <div className="search__result-icon">
                  <svg
                    title="LocationMarkerFilled"
                    viewBox="0 0 24 24"
                    className="g2 ec db"
                  >
                    <g transform="matrix( 1 0 0 1 2.524993896484375 1.0250244140625 )">
                      <path
                        fillRule="nonzero"
                        clipRule="nonzero"
                        d="M16.175 2.775C12.475 -0.925 6.475 -0.925 2.775 2.775C-0.925 6.475 -0.925 12.575 2.775 16.275L9.475 22.975L16.175 16.175C19.875 12.575 19.875 6.475 16.175 2.775ZM9.475 11.475C8.375 11.475 7.475 10.575 7.475 9.475C7.475 8.375 8.375 7.475 9.475 7.475C10.575 7.475 11.475 8.375 11.475 9.475C11.475 10.575 10.575 11.475 9.475 11.475Z"
                        opacity="1"
                      ></path>
                    </g>
                  </svg>
                </div>
                <p className="search__result-label">{result.label}</p>
              </div>
            ))}
        </div>
        <div className="search__input">
          <input
            type="number"
            placeholder="Weight in KG"
            onChange={handleWeightInput}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="search__input">
          {cost > 0 && <p>Total Cost: Rs{cost}</p>}
        </div>
        {cost > 0 && (
          <button className="request-ride__btn" onClick={requestRide}>
            Request Ride
          </button>
        )}
      </div>
    </div>
  );
}

export default withModal(RequestRide)(AddressPicker);
