import { useState, useEffect, useRef } from "react";

interface Call {
  id: string;
  amount: number;
  minutes: number;
  time: string;
}

const STORAGE_KEY = "ana-earnings";
const DATE_KEY = "ana-earnings-date";

function getTodayStr() {
  return new Date().toLocaleDateString("es-AR");
}

function App() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [inputMinutes, setInputMinutes] = useState("");
  const [message, setMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedDate = localStorage.getItem(DATE_KEY);
    const today = getTodayStr();
    if (savedDate !== today) {
      localStorage.setItem(DATE_KEY, today);
      localStorage.removeItem(STORAGE_KEY);
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCalls(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
  }, [calls]);

  const total = calls.reduce((sum, c) => sum + c.amount, 0);
  const totalMinutes = calls.reduce((sum, c) => sum + c.minutes, 0);

  async function fetchMessage(newTotal: number, callCount: number) {
    setLoadingMessage(true);
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: newTotal, callCount }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage("¡Cada llamada es un paso adelante, Ana! Seguí así.");
    } finally {
      setLoadingMessage(false);
    }
  }

  function addCall() {
    const mins = parseFloat(inputMinutes);
    if (!mins || mins <= 0) return;
    const amount = parseFloat((mins * 0.12).toFixed(2));
    const now = new Date();
    const timeStr = now.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newCall: Call = {
      id: crypto.randomUUID(),
      amount,
      minutes: mins,
      time: timeStr,
    };
    const newCalls = [...calls, newCall];
    setCalls(newCalls);
    setInputMinutes("");
    inputRef.current?.focus();
    const newTotal = newCalls.reduce((s, c) => s + c.amount, 0);
    fetchMessage(newTotal, newCalls.length);
  }

  function removeCall(id: string) {
    const newCalls = calls.filter((c) => c.id !== id);
    setCalls(newCalls);
    if (newCalls.length > 0) {
      const newTotal = newCalls.reduce((s, c) => s + c.amount, 0);
      fetchMessage(newTotal, newCalls.length);
    } else {
      setMessage("");
    }
  }

  function resetDay() {
    if (confirm("¿Segura que querés reiniciar el día?")) {
      setCalls([]);
      setMessage("");
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const hoursWorked = (totalMinutes / 60).toFixed(1);
  const previewAmount =
    inputMinutes && parseFloat(inputMinutes) > 0
      ? (parseFloat(inputMinutes) * 0.12).toFixed(2)
      : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 1rem",
        background: "linear-gradient(135deg, #fdf6f0 0%, #fce8d9 100%)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: "#3d2b1f",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "0.25rem" }}>💼</div>
        <h1 style={{ margin: 0, fontSize: "2rem", color: "#c05621" }}>
          Hola, Ana!
        </h1>
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.85rem",
            color: "#7c5a44",
          }}
        >
          Intérprete Médica · $0.12/min
        </p>
      </div>

      {/* Total Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "16px",
          padding: "1.5rem",
          marginBottom: "1.25rem",
          background: "#c05621",
          color: "white",
          boxShadow: "0 4px 24px rgba(192,86,33,0.3)",
        }}
      >
        <p
          style={{
            margin: "0 0 0.25rem",
            fontSize: "0.75rem",
            opacity: 0.8,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Total de hoy
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "3rem",
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ${total.toFixed(2)}
        </p>
        {calls.length > 0 && (
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", opacity: 0.7 }}>
            {calls.length} llamada{calls.length !== 1 ? "s" : ""} ·{" "}
            {totalMinutes} min ({hoursWorked} hs)
          </p>
        )}
      </div>

      {/* AI Message */}
      {(message || loadingMessage) && (
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            borderRadius: "16px",
            padding: "1.25rem 1.5rem",
            marginBottom: "1.25rem",
            background: "#fff5ee",
            border: "1px solid #f0c8a8",
            textAlign: "center",
          }}
        >
          {loadingMessage ? (
            <p style={{ margin: 0, color: "#c05621", fontSize: "0.9rem" }}>
              ✨ Generando mensaje...
            </p>
          ) : (
            <p
              style={{
                margin: 0,
                fontStyle: "italic",
                color: "#7c5a44",
                fontSize: "0.95rem",
                lineHeight: 1.5,
              }}
            >
              ✨ {message}
            </p>
          )}
        </div>
      )}

      {/* Input */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "16px",
          padding: "1.25rem",
          marginBottom: "1rem",
          background: "white",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <p
          style={{
            margin: "0 0 0.75rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#7c5a44",
          }}
        >
          Agregar llamada
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            ref={inputRef}
            type="number"
            min="0"
            step="0.5"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCall()}
            placeholder="Minutos de la llamada..."
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              border: "1.5px solid #f0c8a8",
              fontSize: "1rem",
              outline: "none",
              background: "#fdfaf8",
            }}
          />
          <button
            onClick={addCall}
            disabled={!inputMinutes || parseFloat(inputMinutes) <= 0}
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "12px",
              border: "none",
              background: "#c05621",
              color: "white",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              opacity:
                !inputMinutes || parseFloat(inputMinutes) <= 0 ? 0.4 : 1,
            }}
          >
            + Agregar
          </button>
        </div>
        {previewAmount && (
          <p
            style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#c05621" }}
          >
            = ${previewAmount} por esta llamada
          </p>
        )}
      </div>

      {/* Calls list */}
      {calls.length > 0 && (
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            borderRadius: "16px",
            padding: "1.25rem",
            marginBottom: "1rem",
            background: "white",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <p
            style={{
              margin: "0 0 0.75rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#7c5a44",
            }}
          >
            Llamadas de hoy
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {[...calls].reverse().map((call, i) => (
              <div
                key={call.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  background: "#fdf6f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#c05621",
                      color: "white",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {calls.length - i}
                  </span>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      ${call.amount.toFixed(2)}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "#9c7a66",
                      }}
                    >
                      {call.minutes} min · {call.time}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeCall(call.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#9c7a66",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    opacity: 0.4,
                    padding: "0.25rem",
                  }}
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      {calls.length > 0 && (
        <button
          onClick={resetDay}
          style={{
            background: "none",
            border: "none",
            fontSize: "0.75rem",
            color: "#7c5a44",
            opacity: 0.4,
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          Reiniciar día
        </button>
      )}

      {/* Empty state */}
      {calls.length === 0 && (
        <div style={{ textAlign: "center", padding: "2rem", opacity: 0.4 }}>
          <p style={{ fontSize: "2rem", margin: "0 0 0.5rem" }}>📞</p>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#7c5a44" }}>
            Agregá tu primera llamada del día
          </p>
        </div>
      )}

      <p
        style={{
          marginTop: "2rem",
          fontSize: "0.75rem",
          opacity: 0.3,
          color: "#7c5a44",
        }}
      >
        Hecho con amor para Ana 💛
      </p>
    </div>
  );
}

export default App;
