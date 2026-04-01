"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { BootScreen } from "./BootScreen";
import { SoundToggle } from "./SoundToggle";
import { DQWindow, DQMessage } from "./DQWindow";
import { StatBar } from "./StatBar";
import { useDQAudio } from "@/hooks/use-dq-audio";
import { FloatingNav } from "./FloatingNav";
import { RokuRangerSecret, getRokuTrigger } from "./RokuRanger";

export function MainSite() {
  const [siteVisible, setSiteVisible] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [portraitTaps, setPortraitTaps] = useState(0);
  const [portraitMsg, setPortraitMsg] = useState("");
  const portraitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audio = useDQAudio();

  const handleEnter = useCallback(() => {
    window.scrollTo(0, 0);
    setSiteVisible(true);
    setTimeout(() => {
      setStatsAnimated(true);
      if (audio.soundEnabled) setTimeout(() => audio.startBGM(), 2000);
    }, 300);
  }, [audio]);

  // Fade-in on scroll
  useEffect(() => {
    if (!siteVisible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    const els = document.querySelectorAll(".fade-in");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [siteVisible]);

  return (
    <>
      {siteVisible && <SoundToggle soundEnabled={audio.soundEnabled} onToggle={audio.toggleSound} />}
      <FloatingNav visible={siteVisible} onHover={audio.playCursorSFX} onClick={audio.playSelectSFX} />
      <RokuRangerSecret onTrigger={audio.playSelectSFX} soundEnabled={audio.soundEnabled} onStopMainBGM={audio.stopBGM} onStartMainBGM={audio.startBGM} onSuppressBGM={audio.suppressBGM} onUnsuppressBGM={audio.unsuppressBGM} />

      {!siteVisible && (
        <BootScreen
          onEnter={handleEnter}
          playTextTick={audio.playTextTick}
          playFanfare={audio.playFanfare}
          playCursorSFX={audio.playCursorSFX}
          playGameOverSFX={audio.playGameOverSFX}
          initAudio={audio.initAudio}
        />
      )}

      <div
        ref={containerRef}
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: 20,
          position: "relative",
          zIndex: 1,
          opacity: siteVisible ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        {/* ===== LOGO HERO ===== */}
        <div style={{ textAlign: "center", padding: "60px 20px 40px", marginBottom: 12, position: "relative" }}>
          <Image
            src="/logo_dq.png"
            alt="KATSUMOTO NAKAHARA"
            width={620}
            height={180}
            priority
            style={{
              maxWidth: 620,
              width: "90%",
              height: "auto",
              margin: "0 auto",
              display: "block",
              filter: "drop-shadow(0 0 30px rgba(248,64,64,0.3)) drop-shadow(0 4px 20px rgba(0,0,0,0.6))",
              animation: siteVisible ? "logo-appear 1.5s ease-out" : "none",
            }}
          />
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--gold)",
              marginTop: 16,
              letterSpacing: 6,
              textShadow: "0 0 10px rgba(248,216,48,0.4)",
              animation: siteVisible ? "subtitle-fade 2s ease-out 0.5s both" : "none",
            }}
          >
            ふざけたうぇぶさいとですが しごとはきっちりまじめにこなします。ほんとです。
          </div>
        </div>

        {/* ===== STATUS WINDOW ===== */}
        <div id="sec-profile" />
        <DQWindow title="▶ プロフィール" className="fade-in">
          <div className="hero-grid-responsive" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "start" }}>
            <div style={{ textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/char_portrait.png"
                alt="中原功寛 キャラクター"
                onClick={() => {
                  setPortraitTaps((prev) => {
                    const next = prev + 1;
                    if (next === 1) {
                      setPortraitMsg("");
                    } else if (next < 5) {
                      setPortraitMsg("・・・");
                    } else {
                      setPortraitMsg("へんじがない。ただのしかばねのようだ。");
                    }
                    return next;
                  });
                  audio.playCursorSFX();
                  if (portraitTimerRef.current) clearTimeout(portraitTimerRef.current);
                  portraitTimerRef.current = setTimeout(() => setPortraitMsg(""), 3000);
                }}
                style={{
                  width: 180,
                  height: "auto",
                  border: "3px solid var(--window-border-outer)",
                  borderRadius: 12,
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.5), 0 0 20px rgba(248,216,48,0.2)",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              />
              {portraitMsg && (
                <div style={{
                  marginTop: 6,
                  fontSize: "0.75rem",
                  color: "var(--text)",
                  fontFamily: "var(--font-dot-gothic), monospace",
                  background: "linear-gradient(180deg, #1a1a6c 0%, #10104a 100%)",
                  border: "2px solid var(--window-border-inner)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  animation: "fade-in-msg 0.3s ease-out",
                }}>
                  {portraitMsg}
                </div>
              )}
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: 6 }}>
                <span style={{ color: "var(--gold)", fontSize: "0.8rem" }}>Lv.{(() => { const now = new Date(); let age = now.getFullYear() - 1986; if (now < new Date(now.getFullYear(), 7, 16)) age--; return age; })()}</span> ｜ なかはら
              </div>
              <div
                style={{
                  background: "linear-gradient(90deg, #c83838, #e04848)",
                  color: "#fff",
                  fontSize: "0.75rem",
                  padding: "4px 14px",
                  display: "inline-block",
                  marginTop: 8,
                  borderRadius: 4,
                  textShadow: "1px 1px 0 rgba(0,0,0,0.4)",
                }}
              >
                起業家 × 戦略コンサル × 研修講師
              </div>
            </div>
            <div>
              <div style={{ fontSize: "1.6rem", color: "var(--gold)", marginBottom: 2, textShadow: "2px 2px 0 rgba(0,0,0,0.5), 0 0 10px rgba(248,216,48,0.3)" }}>
                中原 功寛（なかはらかつもと）
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: 10 }}>Katsu Nakahara</div>

              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text)",
                  background: "rgba(0,0,0,0.35)",
                  padding: "12px 16px",
                  border: "2px solid var(--window-border-inner)",
                  borderRadius: 8,
                  marginBottom: 14,
                  lineHeight: 2.1,
                }}
              >
                <span style={{ color: "var(--gold)" }}>しょくぎょう：</span>起業家 / 経営コンサルタント / 農家<br />
                <span style={{ color: "var(--gold)" }}>せいかく：</span>まじめ / せいじつ / あほ<br />
                <span style={{ color: "var(--gold)" }}>きょてん：</span>くまもとけん やまがし（廃校跡に潜む） たまに オランダ<br />
                <span style={{ color: "var(--gold)" }}>そうび：</span>ハーバードMBA ＋ 30,000㎡のYAMAGA BASE ＋ スイカ畑 ＋ 軽トラ ＋ 運転免許<br />
                <span style={{ color: "var(--gold)" }}>しゅみ：</span>ゲーム / まんが / えいが / おんせん / りょこう / からだをうごかすこと<br />
                <span style={{ color: "var(--gold)" }}>とくぎ：</span>資金調達遂行 / 新規事業立上げ / 経営戦略立案 / 事業計画策定 / おもしろいこと考えること / どこでも寝れること<br />
                <span style={{ color: "var(--gold)" }}>パーティー：</span>やまがBASE㈱ / やまがBASE事業協同組合 / ㈱コウサク / ㈱コウサクファーム / ㈱AI STRATEGY PARTNERS / Kosaku NL etc...
              </div>

              <div style={{ fontSize: "0.85rem", lineHeight: 1.9 }}>
                スイカ農家の長男として熊本の田舎に生まれる。高校卒業後に渡米して飛び級で首席卒業し、ベンチャー、金融を経て、ハーバードMBAを取得。
                ベンチャー役員を経験したのち、17年ぶりに帰熊。
                <strong style={{ color: "var(--gold)", textShadow: "0 0 6px rgba(248,216,48,0.3)" }}>気づいたら母校を買っていた。</strong>
                最大借金3億円超。ぐふぇっ。<br /><br />
                好きな言葉は「Stay Hungry. Stay Foolish.」
              </div>

              <div style={{ background: "rgba(0,0,0,0.35)", border: "2px solid var(--window-border-inner)", borderRadius: 8, padding: 14, marginTop: 14 }}>
                <StatBar label="あほさ" value={99} max={99} animated={statsAnimated} />
                <StatBar label="こうどうりょく" value={93} max={99} animated={statsAnimated} />
                <StatBar label="ちりょく" value={88} max={99} animated={statsAnimated} />
                <StatBar label="こうきしん" value={83} max={99} animated={statsAnimated} />
                <StatBar label="たいりょく" value={80} max={99} animated={statsAnimated} />
                <StatBar label="うん" value={50} max={99} animated={statsAnimated} />
                <StatBar label="けいかくせい" value={24} max={99} animated={statsAnimated} />
                <StatBar label="せいりせいとん" value={18} max={99} animated={statsAnimated} />
                <div style={{ fontSize: "0.65rem", color: "var(--orange)", marginTop: 6 }}>
                  ※ けいかくせい と せいりせいとん は よわみ ですが クライアントワーク は しっかりやります。
                </div>
              </div>
            </div>
          </div>
        </DQWindow>

        <div className="fade-in">
          <DQMessage>「で、けっきょく なにしてるひと なの？」と いわれつづけて ながい ねんげつが たった。</DQMessage>
        </div>

        {/* ===== ADVENTURE LOG ===== */}
        <div id="sec-timeline" />
        <DQWindow title="▶ ぼうけんのしょ ― これまでのあゆみ" className="fade-in">
          <Timeline onHover={audio.playCursorSFX} />
        </DQWindow>

        <div className="fade-in">
          <DQMessage>冒険の書を見たあなた 「…で、このひと うちのどんなクエストで役にたつの？」</DQMessage>
        </div>

        {/* ===== MONSTER CARDS ===== */}
        <div id="sec-quests" />
        <DQWindow title="▶ こんなクエストにちょうせんするゆうしゃへ" className="fade-in">
          <MonsterGrid />
        </DQWindow>

        <div className="fade-in">
          <DQMessage>↑ に ひとつでも あてはまったら、したの「じゅもん」が きくかもしれません。</DQMessage>
        </div>

        {/* ===== SKILLS ===== */}
        <div id="sec-skills" />
        <DQWindow title="▶ じゅもん ― できること" className="fade-in">
          <SkillsGrid onHover={audio.playCursorSFX} />
        </DQWindow>

        <div className="fade-in">
          <DQMessage>ところで ほんとうに こうかが あるのか？ なかまに きいてみよう。</DQMessage>
        </div>

        {/* ===== PARTY VOICES ===== */}
        <div id="sec-voices" />
        <DQWindow title="▶ なかまのこえ ― パーティーメンバーの証言" className="fade-in">
          <PartyVoices />
        </DQWindow>

        {/* ===== QUEST LOG ===== */}
        <div id="sec-log" />
        <DQWindow title="▶ クエストログ ― ぼうけん・メディアけいさいのじっせき" className="fade-in">
          <QuestLog onHover={audio.playCursorSFX} />
        </DQWindow>

        {/* ===== VIDEO GALLERY ===== */}
        <div id="sec-video" />
        <DQWindow title="▶ ひみつきち YAMAGA BASE の しょうかいムービー" className="fade-in">
          <VideoGallery onHover={audio.playCursorSFX} onSelect={audio.playSelectSFX} />
        </DQWindow>

        <div className="fade-in">
          <DQMessage>…と、ここまで スクロール してくれた あなたは もう なかま です。</DQMessage>
        </div>

        {/* ===== CTA ===== */}
        <div id="sec-contact" />
        <div
          className="fade-in"
          style={{
            textAlign: "center",
            padding: "36px 24px",
            background: "linear-gradient(180deg, #1a1a6c 0%, #10104a 100%)",
            border: "4px solid var(--gold)",
            borderRadius: 16,
            marginBottom: 24,
            position: "relative",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.4), 0 0 30px rgba(248,216,48,0.1)",
          }}
        >
          <div style={{ position: "absolute", top: 4, left: 4, right: 4, bottom: 4, border: "2px solid var(--gold-dark)", borderRadius: 12, pointerEvents: "none" }} />
          <div style={{ fontSize: "1.2rem", color: "var(--gold)", marginBottom: 8, textShadow: "0 0 12px rgba(248,216,48,0.4)" }}>
            ▶ さくせん ― いっしょにぼうけんする
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginBottom: 24 }}>
            顧問・壁打ち・講演・研修・合宿・スイカ。<br />
            「こんなんできない？」も大歓迎。<br />
            まずは気軽にメッセージをください。
          </div>
          <a
            href="/contact"
            onMouseEnter={audio.playCursorSFX}
            onClick={audio.playSelectSFX}
            style={{
              display: "inline-block",
              padding: "14px 40px",
              background: "linear-gradient(180deg, #e84848, #c02020)",
              border: "3px solid var(--window-border-outer)",
              borderRadius: 8,
              color: "#fff",
              fontFamily: "var(--font-dot-gothic), monospace",
              fontSize: "0.95rem",
              cursor: "pointer",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(200,32,32,0.4)",
              textShadow: "1px 1px 0 rgba(0,0,0,0.5)",
            }}
          >
            ▶ いっしょにぼうけんする（といあわせ）
          </a>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            {[
              { label: "▶ YAMAGA BASE", href: "https://www.yamagabase.com/" },
              { label: "▶ AI STRATEGY PARTNERS", href: "https://www.aistrategypartners.jp/" },
              { label: "▶ コウサクNL", href: "https://www.kosaku-nl.com/" },
            ].map((btn) => (
              <a
                key={btn.label}
                href={btn.href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={audio.playCursorSFX}
                onClick={audio.playSelectSFX}
                style={{
                  display: "inline-block",
                  padding: "8px 20px",
                  background: "linear-gradient(180deg, #d89828, #a07018)",
                  border: "3px solid var(--window-border-outer)",
                  borderRadius: 8,
                  color: "#fff",
                  fontFamily: "var(--font-dot-gothic), monospace",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(168,112,24,0.4)",
                  textShadow: "1px 1px 0 rgba(0,0,0,0.5)",
                }}
              >
                {btn.label}
              </a>
            ))}
          </div>
        </div>

        {/* ===== SNS ===== */}
        <DQWindow title="▶ リンク ― SNS / メディア" className="fade-in">
          <SNSLinks onHover={audio.playCursorSFX} onClick={audio.playSelectSFX} />
        </DQWindow>

        {/* ===== FOOTER ===== */}
        <div style={{ textAlign: "center", padding: 30, color: "var(--text-dim)", fontSize: "0.7rem" }}>
          <div>© 2026 Katsu Nakahara — All quests reserved.</div>
          <div style={{ marginTop: 8 }}>
            <span
              className="blink"
              onClick={() => { const t = getRokuTrigger(); if (t) t(); }}
              style={{ cursor: "pointer" }}
            >
              ▶ PRESS START TO CONTINUE
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== SUB-COMPONENTS ===== */

const timelineData = [
  { year: "1986 ― だい0しょう", event: "スイカ農家の長男として爆誕", badge: "ORIGIN", badgeClass: "green", detail: "熊本県山鹿市鹿央町。代々農家の家系でスイカ栽培は1948年スタートだって。1993年千田小学校入学。小6の夏にシンガポールへ修学旅行。はじめての海外を経験し、少年は海外に興味をもつのであった。" },
  { year: "2005 ― だい1しょう：とべい", event: "単身アメリカへ", badge: "DEPARTURE", badgeClass: "blue", detail: "地元の高校を卒業後、英語も話せないまま単身渡米。打ちのめされながらも飛び級して首席で卒業。海外から日本を見て、かえって愛国心・郷土愛が芽生えるのであった。" },
  { year: "2009 ― だい2しょう：だいとかい", event: "ベンチャー創業 → 金融の世界へ", badge: "GROWTH", badgeClass: "blue", detail: "大学院進学を考えていたが、一時帰国中に友人に誘われベンチャー企業創業メンバーとして参画。はじめてのとうきょうにおそれおののきながらも、ビジネスの面白さを知り大学院進学をやめ、農業系の金融機関へ。シンガポール支店勤務やアセマネで数千億円規模のファンドつくったり、ビジネスの基礎体力を鍛えた時代。" },
  { year: "2016 ― だい3しょう：ハーバード", event: "Harvard Business School MBA", badge: "CLASS OF 2018", badgeClass: "gold", detail: "２回目の挑戦で合格。大きく成長？できた、得難い２年間をすごした。２年目の選択授業ではリーダーシップ関係や、ファイナンス関係、投資関係、起業関係の授業のほか、農業関係の授業も積極的に履修したよ。" },
  { year: "2017 ― イベントはっせい", event: "母校・千田小学校が廃校に", badge: "CRITICAL", badgeClass: "red", detail: "6年間を過ごした小学校が静かに幕を閉じた。", critical: true },
  { year: "2018 ― イベントはっせい―その２", event: "留学費用を返金して銀行を退職", badge: "CRITICAL", badgeClass: "red", detail: "ハーバード卒業後、農業関係の部署への復帰を希望したものの叶わず。会社に留学費用を3200万円を返金して退職（とほほ）。友人と立ち上げたベンチャー企業に9年ぶりに復帰したのだった。", critical: true },
  { year: "2021 ― だい4しょう：きかん", event: "17年ぶりの熊本帰還", badge: "KOSAKU K.K.", badgeClass: "green", detail: "コロナをきっかけに「できるうちにやりたいことを」と思い立ち、ベンチャーで役員をしながらも農業近代化を掲げる「株式会社コウサク」を設立。そして17年ぶりに帰熊した。コウサクの本店を移さねば、と考えていると廃校となった母校が頭をよぎり見に行った。「ここで、何かできないか」— 衝動のまま市役所にメールを送った。" },
  { year: "2022 ― だい５しょう：らんりつ", event: "３つの法人を登記", badges: [{ text: "K.K. KOSAKUFARM", cls: "green" }, { text: "YAMAGA BASE K.K.", cls: "blue" }, { text: "YAMAGABASE BIZ COOP.", cls: "gold" }], detail: "山鹿市と面談後、紆余曲折を経て廃校取得動き出し、やまがBASE株式会社を設立したのだった。その少し前、実家の農園を法人化し株式会社コウサクファームを設立。同年、県内２例目の特定地域づくり事業協同組合「やまがBASE事業協同組合」を設立した。この組合では移住者を雇用し、移住者はマルチワーカーとして地域の人不足に悩む事業者で仕事を担ってくれるのだ。" },
  { year: "2023 ― だい６しょう：こんせん", event: "3億円かけて母校を購入＆改修", badge: "CHAOS", badgeClass: "red", detail: "怒涛の１年だった。１月に廃校の公募で応札。応札者、我々だけ。２月に仮契約、７月に5,200万円で正式購入。10月着工、工事費2億2,700万円。連帯保証3億超。ぐふぇっ。同年4月謎に同時並行でアメリカ法人を設立。10月にはJ-STARXという制度でシリコンバレーに渡米。バッタバタや。", orange: true },
  { year: "2024 ― だい7しょう：オープンのあと", event: "YAMAGA BASE オープン。", badges: [{ text: "YAMAGA BASE", cls: "green" }, { text: "KOSAKU NL", cls: "blue" }, { text: "AI STRATEGY PARTNERS", cls: "gold" }], detail: "最初の1年間で延べ来場者20,000人超。宿泊者2,000人超。いろんなイベントや合宿会場として使ってもらったり、企業向け研修やったり、勉強会開催したり。いろいろ試行錯誤しながらやっています。2025には、コウサクのオランダ拠点 KOSAKU NL が立ち上がったり、AIをしっかりと事業成長に効かせるためのハンズオン型コンサルティングファーム㈱AI Strategy Partnersを立ち上げたりあいかわらずバタバタしているのであった。ぐふぇふぇ。" },
  { year: "2026 ― だい８しょう：そしてこれから", event: "惑わず、志高く", badge: "TO BE CONTINUED", badgeClass: "gold", detail: "レベル40になるこの年、なかはらはさらにギアをあげたい。さらなる挑戦をしたい。世の中のお役に立ちたい。" },
];

const badgeColors: Record<string, { bg: string; color: string; border: string }> = {
  gold: { bg: "rgba(248,216,48,0.15)", color: "var(--gold)", border: "var(--gold-dark)" },
  red: { bg: "rgba(248,64,64,0.15)", color: "var(--red)", border: "#c03030" },
  green: { bg: "rgba(32,232,72,0.15)", color: "var(--hp-green)", border: "#18a838" },
  blue: { bg: "rgba(64,160,248,0.15)", color: "var(--mp-blue)", border: "#2878c0" },
};

function Timeline({ onHover }: { onHover: () => void }) {
  return (
    <div style={{ position: "relative", paddingLeft: 28 }}>
      <div
        style={{
          position: "absolute",
          left: 8, top: 0, bottom: 0, width: 2,
          background: "repeating-linear-gradient(180deg, var(--gold-dark) 0, var(--gold-dark) 4px, transparent 4px, transparent 8px)",
        }}
      />
      {timelineData.map((item) => (
        <div
          key={item.year}
          onMouseEnter={onHover}
          style={{
            position: "relative",
            marginBottom: 14,
            padding: "12px 16px",
            background: "rgba(0,0,0,0.3)",
            border: "2px solid var(--window-border-inner)",
            borderRadius: 8,
            cursor: "default",
            transition: "all 0.2s",
          }}
        >
          <div style={{ position: "absolute", left: -24, color: "var(--gold)", fontSize: "0.65rem", top: 14 }}>▶</div>
          <div style={{ color: "var(--gold)", fontSize: "0.75rem", marginBottom: 2, textShadow: "0 0 4px rgba(248,216,48,0.3)" }}>
            {item.year}
          </div>
          <div style={{ fontSize: "0.85rem", color: item.critical ? "var(--red)" : item.orange ? "var(--orange)" : "var(--text)" }}>
            {item.event}
            {item.badge && item.badgeClass && (
              <span
                style={{
                  display: "inline-block",
                  padding: "1px 8px",
                  fontSize: "0.6rem",
                  marginLeft: 6,
                  verticalAlign: "middle",
                  border: "2px solid",
                  borderRadius: 4,
                  background: badgeColors[item.badgeClass].bg,
                  color: badgeColors[item.badgeClass].color,
                  borderColor: badgeColors[item.badgeClass].border,
                }}
              >
                {item.badge}
              </span>
            )}
            {item.badges && item.badges.map((b) => (
              <span
                key={b.text}
                style={{
                  display: "inline-block",
                  padding: "1px 8px",
                  fontSize: "0.6rem",
                  marginLeft: 6,
                  marginTop: 4,
                  verticalAlign: "middle",
                  border: "2px solid",
                  borderRadius: 4,
                  background: badgeColors[b.cls].bg,
                  color: badgeColors[b.cls].color,
                  borderColor: badgeColors[b.cls].border,
                }}
              >
                {b.text}
              </span>
            ))}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: 4 }}>{item.detail}</div>
        </div>
      ))}
    </div>
  );
}

const monsters = [
  { icon: "🤯", name: "けいえいこどくのじゅもん", desc: "社長は孤独。相談相手がいない。社内には本音を言えない。壁打ちしたいけど、コンサルは机上の空論ばかり。", who: "▸ 経営者 / 事業承継者 / CxO" },
  { icon: "💀", name: "しんじぎょうまよいのもり", desc: "アイデアはある。でも踏み出せない。誰に相談すればいいかわからない。Googleで「新規事業 進め方」って検索した回数、覚えてる？", who: "▸ 新規事業担当者 / 起業を考えている方" },
  { icon: "🧩", name: "AIかつようできないびょう", desc: "「AIを導入しろ」と上から降ってきた。でも何から始めればいいか誰もわからない。ベンダーの言うことは横文字だらけ。", who: "▸ DX推進担当 / AI活用を検討中の企業" },
  { icon: "👔", name: "しゃいんかくせいふのう", desc: "研修をやっても翌日には忘れる。座学だけじゃ人は変わらない。本当に火がつく体験が必要だと薄々気づいている。", who: "▸ 企業の人事・研修担当 / 経営者" },
  { icon: "🌾", name: "のうぎょうレガシーのやみ", desc: "農業は儲からない？後継者がいない？それ、仕組みの問題かも。オランダは日本の130分の1の面積で世界2位の農業輸出国。", who: "▸ 農業経営者 / 農業×テクノロジーに関心がある方" },
  { icon: "🏚️", name: "ちほうかそかのろい", desc: "「地方を盛り上げたい」の想いはある。でも人が来ない、残らない、やり方がわからない。補助金は切れたら終わり。呪いは深い。", who: "▸ 自治体職員 / 地域おこし / 地方で事業を始めたい方" },
];

function MonsterGrid() {
  return (
    <div className="two-col-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {monsters.map((m) => (
        <div key={m.name} style={{ padding: 16, background: "rgba(0,0,0,0.3)", border: "2px solid var(--window-border-inner)", borderRadius: 8, cursor: "default" }}>
          <div style={{ fontSize: "1.8rem", marginBottom: 6 }}>{m.icon}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--red)", marginBottom: 6, textShadow: "0 0 4px rgba(248,64,64,0.3)" }}>{m.name}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", lineHeight: 1.7 }}>{m.desc}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--gold)", marginTop: 8, paddingTop: 6, borderTop: "1px solid rgba(168,152,96,0.2)" }}>{m.who}</div>
        </div>
      ))}
    </div>
  );
}

const CONTACT_FORM = "https://forms.gle/zzpZHedpgyuU75Ts6";

const skills = [
  { icon: "🧠", name: "顧問・アドバイザリー", desc: "経営戦略、資金調達、新規事業、海外展開。「それ、やめたほうがいい」も正直に言います。机上の空論じゃない壁打ち相手。", cost: "▸ MP消費: ようみつもり", link: "/contact", linkLabel: "▶ といあわせる" },
  { icon: "🗣️", name: "講演・セミナー", desc: "農業経営、地方創生、起業、MBA、AI活用、リーダーシップ。教科書的な話はもちろん、教科書にない泥臭い実体験だけでいくらでもしゃべれます。退屈させません。", cost: "▸ MP消費: ようみつもり", link: "/contact", linkLabel: "▶ といあわせる" },
  { icon: "🏫", name: "YAMAGA BASE かいいん", desc: "24時間365日使えるコワーキングスペース＆ジムなどを有する複合施設YAMAGA BASE。AIとMBAの知識で起業・新規事業を前に進めるコミュニティbY。なんでもありの秘密基地。「面白い人が集まる場所」に、あなたも混ざりませんか。", cost: "▸ MP消費: げつがくせい（しょうさいはホームページ）", links: [{ href: "https://www.yamagabase.com/membership", label: "▶ しせつかいいん" }, { href: "https://www.yamagabase.com/community", label: "▶ コミュニティかいいん" }] },
  { icon: "⚔️", name: "企業研修・合宿", desc: "廃校の体育館で汗をかいて、焚き火を囲んで語り合う。座学じゃ絶対に生まれない一体感。翌日から目の色が変わるやつ。やまがBASE㈱が主催するオリジナル研修も不定期開催ながら大好評。", cost: "▸ MP消費: ようみつもり（しゅくはくプランあり・しょうさいはホームページ）", links: [{ href: "https://www.yamagabase.com/", label: "▶ だんたいしゅくはく" }, { href: "https://www.yamagabase.com/corp_sponsorship", label: "▶ やまがBASEけんしゅう" }] },
  { icon: "🤖", name: "AI Strategy Partners", desc: "「AI導入」の号令で途方に暮れてるあなたへ。構想→実行→内製化を一気通貫。テクノロジー×経営を橋渡しする仮想CXOチーム。事業戦略・事業計画策定・資本政策・資金調達・オペレーション改善、なんでもござれ。机上の空論で終わらせません。", cost: "▸ MP消費: ようみつもり", links: [{ href: "https://www.aistrategypartners.jp/", label: "▶ うぇぶさいとからといあわせる" }] },
  { icon: "🍉", name: "スイカ・農泊（きせつげんてい）", desc: "戦後からつづくスイカ農園を法人化したコウサクファーム。スイカの名産地熊本県鹿本地域のあま～いスイカは贈答用に最強。耕作放棄とで藪になっていた土地を開墾し、自前の杉を使ったログハウスでの農泊体験も。詳しくはインスタグラムをチェックしてはいよ。", cost: "▸ MP消費: じか（きせつもの）", links: [{ href: "https://www.instagram.com/kosakufarm/", label: "▶ インスタグラムをちぇっく" }] },
  { icon: "🌷", name: "オランダ農業視察", desc: "日本の130分の1の面積で世界2位の農業輸出国オランダ。現地拠点KOSAKU NLと連携したオランダ農業現地視察やオンライン視察のアレンジ、生の情報をお届けします。", cost: "▸ MP消費: ようみつもり", links: [{ href: "https://www.kosaku-nl.com/", label: "▶ コウサクNLうえぶさいと" }, { href: "https://note.com/ko_saku/n/ne47fcdee0e2e", label: "▶ オランダのnote" }] },
  { icon: "💬", name: "その他なんでも相談してね", desc: "上のどれにも当てはまらなくても大丈夫。「こんなこと相談していいのかな？」ってやつほど面白い。気軽にどうぞ。", cost: "▸ MP消費: むりょう（しょかい）", link: "/contact", linkLabel: "▶ といあわせる" },
];

function SkillsGrid({ onHover }: { onHover: () => void }) {
  return (
    <div className="two-col-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {skills.map((s) => (
        <div key={s.name} onMouseEnter={onHover} style={{ padding: 14, background: "rgba(0,0,0,0.3)", border: "2px solid var(--window-border-inner)", borderRadius: 8, cursor: "default" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{s.icon}</div>
          <div style={{ fontSize: "0.9rem", color: "var(--gold)", marginBottom: 6, textShadow: "0 0 4px rgba(248,216,48,0.3)" }}>{s.name}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", lineHeight: 1.7 }}>{s.desc}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--mp-blue)", marginTop: 8 }}>{s.cost}</div>
          {s.link && (
            <a
              href={s.link}
              style={{
                display: "inline-block",
                marginTop: 10,
                padding: "4px 14px",
                fontSize: "0.7rem",
                color: "var(--gold)",
                border: "2px solid var(--gold-dark)",
                borderRadius: 6,
                background: "rgba(248,216,48,0.1)",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(248,216,48,0.25)"; }}
              onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(248,216,48,0.1)"; }}
            >
              {s.linkLabel}
            </a>
          )}
          {s.links && s.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: 10,
                marginRight: 8,
                padding: "4px 14px",
                fontSize: "0.7rem",
                color: "var(--gold)",
                border: "2px solid var(--gold-dark)",
                borderRadius: 6,
                background: "rgba(248,216,48,0.1)",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(248,216,48,0.25)"; }}
              onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(248,216,48,0.1)"; }}
            >
              {l.label}
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}

const voices = [
  { quote: "正直、廃校で研修って聞いた時は半信半疑でした。でも体育館でチームビルディングして、焚き火囲んで本音で話したら、部署間の壁が嘘みたいに消えた。翌月の会議、空気が全然違いました", who: "企業研修参加者", role: "製造業 人事部長" },
  { quote: "コンサルに何百万も払ったけど、綺麗な資料が増えただけ。中原さんは1時間で「それ、やらんでいい」と言ってくれた。あの一言で半年分の迷いが消えた", who: "顧問クライアント", role: "スタートアップ CEO" },
  { quote: "農業のイメージが完全に変わった。オランダの話を聞いて「仕組みで勝てるんだ」って初めて思えた。うちの農協にも来てほしい", who: "講演参加者", role: "農業経営塾 受講生" },
  { quote: "YAMAGA BASEに来るたびに面白い人がいる。東京のコワーキングスペースより刺激がある。スイカも美味い", who: "YAMAGA BASE会員", role: "IT企業 リモートワーカー" },
];

function PartyVoices() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {voices.map((v, i) => (
        <div key={i} style={{ padding: "16px 20px", background: "rgba(0,0,0,0.3)", border: "2px solid var(--window-border-inner)", borderRadius: 8 }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.8, marginBottom: 10 }}>
            <span style={{ color: "var(--gold)" }}>「</span>{v.quote}<span style={{ color: "var(--gold)" }}>」</span>
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", textAlign: "right" }}>
            <span style={{ color: "var(--mp-blue)" }}>{v.who}</span> ― {v.role}
          </div>
        </div>
      ))}
    </div>
  );
}

const quests: { done: boolean; text: string; detail?: string; href?: string }[] = [
  { done: true, text: "アメリカの大学で全学期で成績優秀者名簿（Dean's List）・飛び級で首席卒業（2008）" },
  { done: true, text: "若手海外勤務選抜（2012）" },
  { done: true, text: "お昼休み明けのラジオ体操のキレがいいで賞（2014）" },
  { done: true, text: "社内留学制度・留学候補生選抜（2014）" },
  { done: true, text: "ハーバードビジネススクール合格（2015）" },
  { done: true, text: "（メディア / en AMBI）変わりゆくお葬式。「よりそう」が作る、ご家族、葬儀社、寺院に優しいプラットフォーム（2020）", href: "https://en-ambi.com/featured/510/" },
  { done: true, text: "（メディア / Japan Times）Coronavirus pandemic fuels trend toward smaller funerals in Japan（2020）", href: "https://www.japantimes.co.jp/news/2020/03/30/business/coronavirus-pandemic-trend-smaller-funerals-japan/" },
  { done: true, text: "熊本市アクセラレプログラムHIGO CANVAS採択（2021）" },
  { done: true, text: "（メディア / 熊本日日新聞）異色の起業家、母校跡で創業（2023）", href: "https://kumanichi.com/articles/955431" },
  { done: true, text: "（メディア / 日本経済新聞）「廃校再生」はなぜ成功したか　学ぶ喜び、ビジネス生む（2025）", href: "https://www.nikkei.com/article/DGXZQOUD215SY0R20C25A2000000/" },
  { done: true, text: "（メディア / ITメディア）熊本の廃校が「世界最先端のビジネススクール」に　異色スタートアップの、故郷への思いと緻密な戦略（2025）", href: "https://www.itmedia.co.jp/business/articles/2501/05/news017.html" },
  { done: true, text: "（メディア / MITテクノロジーレビュー）MITの挑戦精神を日本の子どもたちに——廃校舞台に広がる学びの輪（2025）", href: "https://www.technologyreview.jp/s/367967/bringing-mits-spirit-of-challenge-to-japanese-children-learning-circles-expand-from-former-school-site/" },
  { done: true, text: "令和6年度 九州農政局「ディスカバー農山漁村（むら）の宝」選定（2025）" },
  { done: true, text: "「第18回キッズデザイン賞」", href: "https://www.space-tokyo.co.jp/info/20241002/" },
  { done: true, text: "「第43回ディスプレイ産業賞」", href: "https://www.space-tokyo.co.jp/info/20241016/" },
  { done: true, text: "「第58回日本サインデザイン賞」", href: "https://www.space-tokyo.co.jp/info/20241007/" },
  { done: true, text: "廃校を購入し複合施設に改修", detail: "初年度延べ来場者20,000人超を（2024-）" },
  { done: true, text: "特定地域づくり事業協同組合を設立", detail: "県内2例目。累計9名の若者が山鹿市に移住（2023-）" },
  { done: true, text: "講演・研修実績多数", detail: "にぎわいラボ、熊本県経済同友会フォーラム、山鹿法人会総会、おおいた農業経営塾、熊日経営セミナー、やまが未来創造塾、MIT JAPAN STEAM WORKSHOP、各種企業研修 他" },
  { done: true, text: "J-STARX シリコンバレー超上級コース採択（2023）" },
  { done: true, text: "欧州拠点（オランダ）設立", detail: "KOSAKU NL として農業リサーチ・視察受入・企業支援（2025）" },
  { done: false, text: "日本の農業をCollective Geniusでアップデートする", detail: "しんこうちゅう" },
  { done: false, text: "山鹿から失敗に寛容なコンソーシアムをつくる", detail: "しんこうちゅう" },
];

const VIDEOS = [
  { id: "iYpuol2I1BY", label: "" },
  { id: "cERYdxP_1G4", label: "" },
  { id: "Bth_DS0HAS0", label: "" },
  { id: "YHZBbVXSBSc", label: "" },
  { id: "tyxaamA7v74", label: "" },
  { id: "y9GIsF8eJVk", label: "" },
];

function VideoGallery({ onHover, onSelect }: { onHover: () => void; onSelect: () => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {VIDEOS.map((v) => (
        <a
          key={v.id}
          href={`https://www.youtube.com/watch?v=${v.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={onHover}
          onClick={onSelect}
          style={{
            display: "block",
            position: "relative",
            border: "2px solid var(--window-border-inner)",
            borderRadius: 8,
            overflow: "hidden",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
            alt="YAMAGA BASE動画"
            style={{ display: "block", width: "100%", height: "auto" }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 48,
              height: 48,
              background: "rgba(248,64,64,0.9)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(248,64,64,0.5)",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderStyle: "solid",
                borderWidth: "10px 0 10px 18px",
                borderColor: "transparent transparent transparent #fff",
                marginLeft: 3,
              }}
            />
          </div>
        </a>
      ))}
      <a
        href="https://www.youtube.com/@yamagabase"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={onHover}
        onClick={onSelect}
        style={{
          display: "block",
          textAlign: "center",
          marginTop: 16,
          padding: "8px 0",
          fontSize: "0.85rem",
          color: "var(--gold)",
          textDecoration: "none",
          border: "2px solid var(--gold-dark)",
          borderRadius: 8,
          background: "rgba(248,216,48,0.08)",
        }}
      >
        ▶ もっと見る（YouTubeチャンネル）
      </a>
    </div>
  );
}

function QuestLog({ onHover }: { onHover: () => void }) {
  return (
    <div>
      {quests.map((q, i) => (
        <div
          key={i}
          onMouseEnter={onHover}
          style={{
            display: "flex",
            alignItems: "flex-start",
            padding: "8px 0",
            borderBottom: i < quests.length - 1 ? "1px solid rgba(168,152,96,0.25)" : "none",
          }}
        >
          <span
            style={{
              color: q.done ? "var(--hp-green)" : "var(--orange)",
              marginRight: 10,
              fontSize: "0.85rem",
              flexShrink: 0,
              textShadow: q.done ? "0 0 6px rgba(32,232,72,0.4)" : undefined,
            }}
          >
            {q.done ? "[✓]" : "[…]"}
          </span>
          <div style={{ fontSize: "0.8rem", color: q.done ? "var(--text)" : "var(--orange)" }}>
            {q.href ? (
              <a href={q.href} target="_blank" rel="noopener noreferrer" style={{ color: q.done ? "var(--gold)" : "var(--orange)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                {q.text}
              </a>
            ) : (
              <strong style={{ color: q.done ? "var(--gold)" : "var(--orange)" }}>{q.text}</strong>
            )}
            {q.detail && ` — ${q.detail}`}
          </div>
        </div>
      ))}
      <div style={{ textAlign: "right", fontSize: "0.8rem", color: "var(--gold)", marginTop: 12, textShadow: "0 0 6px rgba(248,216,48,0.3)" }}>
        他多数・・・！
      </div>
    </div>
  );
}

const snsLinks = [
  { label: "note", href: "https://note.com/ko_saku" },
  { label: "Podcast（じゅんびちゅう）", href: "#" },
  { label: "YouTube", href: "https://www.youtube.com/@%E3%81%AA%E3%81%8B%E3%81%AF%E3%82%89%E3%81%8B%E3%81%A4%E3%82%82%E3%81%A8/shorts" },
  { label: "Instagram", href: "https://www.instagram.com/katsu.nakahara/" },
  { label: "Threads", href: "https://www.threads.com/@katsu.nakahara" },
  { label: "X", href: "https://x.com/katsumomo8" },
];

function SNSLinks({ onHover, onClick }: { onHover: () => void; onClick: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
      {snsLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={onHover}
          onClick={onClick}
          style={{
            padding: "8px 14px",
            background: "rgba(0,0,0,0.3)",
            border: "2px solid var(--window-border-inner)",
            borderRadius: 6,
            color: "var(--text)",
            textDecoration: "none",
            fontSize: "0.8rem",
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
