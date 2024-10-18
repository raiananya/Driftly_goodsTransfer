import { useState } from "react";

const withModal = (ModalComponent) => (WrapperComponent) => {
  const WithModal = (props) => {
    const [isModalShown, setIsModalShown] = useState(false);

    return (
      <>
        <WrapperComponent {...props} toggleModal={setIsModalShown} />
        {isModalShown && <ModalComponent toggleModal={setIsModalShown} />}
      </>
    );
  };

  return WithModal;
};

export default withModal;
