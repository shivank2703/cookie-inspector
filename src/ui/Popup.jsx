// src/ui/Popup.jsx
import React, { useEffect, useState } from "react";
// Auto-register all Chart.js elements & plugins
import Chart from "chart.js/auto";
import { Doughnut } from "react-chartjs-2";
import "../extension/popup.css";

// Category colors
const COLORS = {
  necessary: "#4caf50",
  preferences: "#2196f3",
  analytics: "#ff9800",
  marketing: "#9c27b0",
  dangerous: "#f44336",
};

// Category regex patterns
const CATEGORY_PATTERNS = {
  necessary: [/^session/i, /^auth/i, /token/i],
  analytics: [/^_ga/, /^_gid/, /^ga_/],
  marketing: [/^_fbp/, /^_fbclid/, /ads/i],
  dangerous: [/doubleclick/i, /track/i, /pixel/i, /collect/i],
  preferences: [/^pref/i, /lang/i],
};

function determineCategory(cookie) {
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (patterns.some((p) => p.test(cookie.name))) {
      return category;
    }
  }
  return "preferences";
}

export default function Popup() {
  const [cookies, setCookies] = useState([]);
  const [counts, setCounts] = useState({
    necessary: 0,
    preferences: 0,
    analytics: 0,
    marketing: 0,
    dangerous: 0,
  });
  const [filter, setFilter] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [pageUrl, setPageUrl] = useState("");

  // Fetch & tally cookies
  const fetchCookies = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      setPageUrl(url);
      chrome.cookies.getAll({ url }, (all) => {
        setCookies(all);
        const tally = {
          necessary: 0,
          preferences: 0,
          analytics: 0,
          marketing: 0,
          dangerous: 0,
        };
        all.forEach((c) => {
          const cat = determineCategory(c);
          tally[cat] = (tally[cat] || 0) + 1;
        });
        setCounts(tally);
      });
    });
  };

  // Export detailed CSV
  const exportCSV = () => {
    const header = `"Name","Value","Domain","Path","Expires","Secure","HttpOnly","SameSite","Category"\n`;
    const rows = cookies.map((c) => {
      const exp = c.expirationDate
        ? new Date(c.expirationDate * 1000).toLocaleString()
        : "Session";
      return `"${c.name}","${c.value}","${c.domain}","${c.path}","${exp}",` +
             `"${c.secure}","${c.httpOnly}","${c.sameSite}","${determineCategory(c)}"`;
    });
    const csvContent = header + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cookies_detailed.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchCookies();
  }, []);

  // Prepare chart data
  const labels = Object.keys(counts);
  const data = labels.map((l) => counts[l]);
  const backgroundColor = labels.map((l) => COLORS[l] || "#ccc");

  return (
    <div className="container">
      <div className="header">
        <h2>Cookie Inspector 👮‍♂️</h2>
        <div className="header-controls">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search cookies..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <button className="refresh-btn" onClick={fetchCookies} title="Refresh">
            ⟳
          </button>
          <button
            className="export-btn"
            onClick={exportCSV}
            title="Export Detailed CSV"
          >
            📤
          </button>
        </div>
      </div>

      <div className="chart-wrapper">
        {/* Summary tiles above chart */}
        <div className="summary-tiles">
          <div className="tile">🟢 Necessary: {counts.necessary}</div>
          <div className="tile">🔵 Preferences: {counts.preferences}</div>
          <div className="tile">🟠 Analytics: {counts.analytics}</div>
          <div className="tile">🟣 Marketing: {counts.marketing}</div>
          <div className="tile">🔴 Dangerous: {counts.dangerous}</div>
        </div>
        
        <div style={{ width: "100%", height: 160 }}>
          <Doughnut
            data={{ labels, datasets: [{ data, backgroundColor, borderWidth: 2, hoverOffset: 6 }] }}
            options={{
              cutout: "85%",
              radius: "95%",
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const v = ctx.raw,
                        arr = ctx.dataset.data;
                      const p = arr.reduce((s, n) => s + n, 0);
                      return `${ctx.label}: ${v} (${p ? ((v / p) * 100).toFixed(1) : 0}%)`;
                    },
                  },
                },
              },
              animation: { animateScale: true, duration: 600 },
            }}
          />
        </div>
      </div>

      <table className="cookie-table">
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Expires</th>
          </tr>
        </thead>
        <tbody>
          {cookies
            .filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()))
            .map((c) => {
              const cat = determineCategory(c);
              return (
                <React.Fragment key={`${c.name}-${c.domain}`}>
                  <tr
                    onClick={() =>
                      setExpandedRows((p) => ({
                        ...p,
                        [c.name]: !p[c.name],
                      }))
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <button
                        className="delete-btn"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          chrome.cookies.remove(
                            { url: pageUrl, name: c.name },
                            fetchCookies
                          );
                        }}
                      >
                        🗑️
                      </button>
                      <span
                        className="cookie-marker"
                        style={{
                          background: COLORS[cat],
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          display: "inline-block",
                          marginRight: 8,
                          verticalAlign: "middle",
                        }}
                      />
                      {c.name}
                    </td>
                    <td>
                      {c.expirationDate
                        ? new Date(c.expirationDate * 1000).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Session"}
                    </td>
                  </tr>
                  {expandedRows[c.name] && (
                    <tr className="details-row">
                      <td colSpan="2">
                        Domain: {c.domain}, Path: {c.path}, Secure:{" "}
                        {c.secure ? "Yes" : "No"}, HttpOnly:{" "}
                        {c.httpOnly ? "Yes" : "No"}, SameSite: {c.sameSite}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}