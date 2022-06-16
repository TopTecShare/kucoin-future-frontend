import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";

type History = {
  id: number;
  contracts: string;
  type: string;
  PNL: string;
  position: string;
};

const Histories = () => {
  const [histories, setHistories] = useState([] as History[]);

  useEffect(() => {
    fetch(`/api`, {
      headers: {
        accepts: "application/json",
      },
    })
      .then((e) => e.json())
      .then(setHistories);
  }, []);

  const renderedHistories = histories.map((history: History, i) => {
    return (
      <tr key={history.id}>
        <td>{history.contracts}</td>
        <td>{history.type}</td>
        <td className="green-color">{history.PNL}</td>
        <td>{history.position}</td>
      </tr>
    );
  });
  return (
    <div className="container mt-3">
      <table className="table table-sm table-hover">
        <thead>
          <tr>
            <th scope="col">Contracts</th>
            <th scope="col">Type</th>
            <th className="align-center" scope="col">
              Closed Position PNL
            </th>
            <th scope="col">Position Closed</th>
          </tr>
        </thead>
        <tbody>{renderedHistories}</tbody>
      </table>
    </div>
  );
};

export default Histories;
