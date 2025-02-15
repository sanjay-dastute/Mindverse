import React from "react";
import { Spin } from "antd";
const Loading = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
        <Spin size="large" />
        <div style={{ marginTop: "10px" }}>Loading...</div>
      </div>
    </div>
  );
};
export default Loading;
