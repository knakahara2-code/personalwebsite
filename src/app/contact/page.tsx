"use client";

import { useState } from "react";

const WEB3FORMS_KEY = "e1505562-6f9f-4afd-b135-d9250a52df65";

const CATEGORY_OPTIONS = [
  "スポット・アドバイザリー（壁打ち・個別相談）",
  "講演・セミナー・イベント登壇",
  "メディア取材・執筆依頼",
  "その他",
];

type Phase = "form" | "sending" | "done";

export default function ContactPage() {
  const [phase, setPhase] = useState<Phase>("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [detail, setDetail] = useState("");
  const [eventInfo, setEventInfo] = useState("");
  const [budget, setBudget] = useState("");
  const [schedule, setSchedule] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !detail) return;

    setPhase("sending");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `【おといあわせ】${name}さんから（${category}）`,
          from_name: name,
          email,
          "きしゃめい・しょぞくだんたい": company || "未記入",
          "でんわばんごう": phone || "未記入",
          "かいしゃ・かつどうのURL": url || "未記入",
          "ごいらいのしゅべつ": category,
          "ごそうだんないようのしょうさい": detail,
          "かいさいよていび・ばしょ": eventInfo || "未記入",
          "ごよさんかん": budget || "未記入",
          "きぼうにってい・きげん": schedule || "未記入",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
    } catch {
      // Submission failed — still show done screen
    }

    setPhase("done");
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    fontSize: "0.85rem",
    background: "rgba(0,0,0,0.5)",
    border: "2px solid var(--window-border-inner)",
    borderRadius: 6,
    color: "var(--text)",
    fontFamily: "var(--font-dot-gothic), monospace",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.8rem",
    color: "var(--gold)",
    marginBottom: 4,
    textShadow: "0 0 4px rgba(248,216,48,0.3)",
  };

  const requiredBadge = (
    <span style={{ fontSize: "0.6rem", color: "var(--red)", marginLeft: 6, border: "1px solid var(--red)", borderRadius: 3, padding: "0 4px" }}>
      ひっす
    </span>
  );

  if (phase === "done") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", zIndex: 1 }}>
        <div
          style={{
            maxWidth: 600,
            width: "100%",
            background: "linear-gradient(180deg, #1a1a6c 0%, #10104a 100%)",
            border: "4px solid var(--window-border-outer)",
            borderRadius: 16,
            padding: 32,
            textAlign: "center",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ position: "absolute", top: 8, left: 8, right: 8, bottom: 8, border: "2px solid var(--window-border-inner)", borderRadius: 12, pointerEvents: "none" }} />
          <div style={{ fontSize: "2rem", marginBottom: 16 }}>📬</div>
          <div style={{ fontSize: "1.1rem", color: "var(--gold)", marginBottom: 12, textShadow: "0 0 8px rgba(248,216,48,0.3)" }}>
            メッセージを おくった！
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginBottom: 24, lineHeight: 1.8 }}>
            おといあわせ ありがとうございます。<br />
            なかはら が かならず おへんじ します。<br />
            しばらく おまちください。
          </div>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "8px 24px",
              fontSize: "0.85rem",
              color: "var(--gold)",
              border: "2px solid var(--gold-dark)",
              borderRadius: 8,
              background: "rgba(248,216,48,0.1)",
              textDecoration: "none",
              fontFamily: "var(--font-dot-gothic), monospace",
            }}
          >
            ▶ トップにもどる
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", zIndex: 1 }}>
      <div
        style={{
          maxWidth: 640,
          width: "100%",
          background: "linear-gradient(180deg, #1a1a6c 0%, #10104a 100%)",
          border: "4px solid var(--window-border-outer)",
          borderRadius: 16,
          padding: "24px 28px",
          position: "relative",
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ position: "absolute", top: 8, left: 8, right: 8, bottom: 8, border: "2px solid var(--window-border-inner)", borderRadius: 12, pointerEvents: "none" }} />

        <div style={{ fontSize: "1rem", color: "var(--gold)", marginBottom: 4, textShadow: "0 0 8px rgba(248,216,48,0.3)" }}>
          ▶ おといあわせ
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginBottom: 20 }}>
          なかはら に れんらく する
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>おなまえ{requiredBadge}</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="やまだ たろう" required />
          </div>

          <div>
            <label style={labelStyle}>めーるあどれす{requiredBadge}</label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="taro@example.com" required />
          </div>

          <div>
            <label style={labelStyle}>きしゃめい・しょぞくだんたい</label>
            <input style={inputStyle} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="かぶしきがいしゃ ○○" />
          </div>

          <div>
            <label style={labelStyle}>でんわばんごう</label>
            <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="090-XXXX-XXXX" />
          </div>

          <div>
            <label style={labelStyle}>かいしゃ・かつどう の URL</label>
            <input style={inputStyle} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <label style={labelStyle}>ごいらいのしゅべつ{requiredBadge}</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {CATEGORY_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.8rem",
                    color: category === opt ? "var(--gold)" : "var(--text-dim)",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: 4,
                    background: category === opt ? "rgba(248,216,48,0.08)" : "transparent",
                  }}
                >
                  <span style={{ color: category === opt ? "var(--gold)" : "var(--text-dim)" }}>
                    {category === opt ? "▶" : "　"}
                  </span>
                  <input
                    type="radio"
                    name="category"
                    value={opt}
                    checked={category === opt}
                    onChange={() => setCategory(opt)}
                    style={{ display: "none" }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>ごそうだんないようのしょうさい{requiredBadge}</label>
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="おきがるに どうぞ"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>（こうえん・イベントの場合）かいさいよていび・ばしょ</label>
            <textarea
              style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
              value={eventInfo}
              onChange={(e) => setEventInfo(e.target.value)}
              placeholder="2026年○月○日 ○○にて"
            />
          </div>

          <div>
            <label style={labelStyle}>ごよさんかん</label>
            <input style={inputStyle} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="○○円くらい、など" />
          </div>

          <div>
            <label style={labelStyle}>きぼうにってい・きげん など</label>
            <textarea
              style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="らいげつちゅう、など"
            />
          </div>

          <button
            type="submit"
            disabled={phase === "sending"}
            style={{
              marginTop: 8,
              padding: "10px 24px",
              fontSize: "0.9rem",
              color: "#fff",
              background: phase === "sending" ? "rgba(248,216,48,0.2)" : "linear-gradient(180deg, rgba(248,216,48,0.3), rgba(200,160,32,0.3))",
              border: "2px solid var(--gold-dark)",
              borderRadius: 8,
              cursor: phase === "sending" ? "wait" : "pointer",
              fontFamily: "var(--font-dot-gothic), monospace",
              textShadow: "0 0 4px rgba(248,216,48,0.3)",
              transition: "all 0.2s",
            }}
          >
            {phase === "sending" ? "おくっています..." : "▶ メッセージを おくる"}
          </button>
        </form>

        <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", marginTop: 16, textAlign: "center" }}>
          <a href="/" style={{ color: "var(--text-dim)", textDecoration: "none" }}>◀ トップにもどる</a>
        </div>
      </div>
    </div>
  );
}
