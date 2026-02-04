import React from "react";

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
      background: "#f5f5f5"
    }}>
      <div style={{
        background: "#fff",
        padding: "32px",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center"
      }}>
        <h1 style={{ marginBottom: "12px" }}>
          Checklist de Fluxo de Trabalho
        </h1>
        <p style={{ color: "#555", lineHeight: 1.5 }}>
          Seu app de organização para eventos fotográficos
        </p>

        <p style={{ marginTop: "24px", fontSize: "14px", color: "#777" }}>
          ✅ Projeto rodando corretamente
        </p>
      </div>
    </div>
  );
}

