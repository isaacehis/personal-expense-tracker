import { ImageResponse } from "next/og";

export const alt = "ExpenseTrack personal finance dashboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#020617",
        color: "#f8fafc",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div
          style={{
            display: "flex",
            width: "96px",
            height: "96px",
            borderRadius: "24px",
            alignItems: "center",
            justifyContent: "center",
            background: "#34d399",
            color: "#022c22",
            fontSize: "38px",
            fontWeight: 900,
          }}
        >
          ET
        </div>
        <div style={{ fontSize: "42px", fontWeight: 800 }}>ExpenseTrack</div>
      </div>
      <div style={{ marginTop: "52px", fontSize: "66px", fontWeight: 800 }}>
        Know where your money goes.
      </div>
      <div style={{ marginTop: "24px", fontSize: "30px", color: "#94a3b8" }}>
        Income · Expenses · Budgets · Analytics
      </div>
    </div>,
    size,
  );
}
