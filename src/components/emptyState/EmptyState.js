import React from "react";

const EmptyState = ({ message = "No hay propiedades para esta búsqueda" }) => (
  <p style={{ width: "100%", textAlign: "center", padding: "20px" }}>{message}</p>
);

export default EmptyState;
