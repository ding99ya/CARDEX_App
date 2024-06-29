import React from "react";
import { useEffect } from "react";
import axios from "axois";

function Card() {
  const [cards, setCards] = useState([]);
  useEffect(() => {
    axios.get("/cards").then((response) => {
      setCards(response.data);
    });
  }, []);
  return (
    <div className="flex flex-col">
      <div>title</div>
    </div>
  );
}

export default Card;
