import { AppHeader } from "@/components/generator/AppHeader";
import { CsvInputCard } from "@/components/generator/CsvInputCard";
import { InstructionsCard } from "@/components/generator/InstructionsCard";
import { TemplateCard } from "@/components/generator/TemplateCard";
import { StarOrnament } from "@/components/generator/Ornaments";
import { Toast } from "@/components/common/Toast";
import { useBlast } from "@/context/BlastContext";
import { useClipboard } from "@/hooks/useClipboard";
import { useCallback, useState } from "react";

export default function Home() {
  const {
    error,
    isParsing,
    generate,
    generated,
    clickedLinks,
    markClicked,
    setError,
  } = useBlast();
  const { copyText, lastError } = useClipboard();
  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const showToast = useCallback((message: string) => {
    setToast({ open: true, message });
  }, []);

  const copyMessage = async (text: string) => {
    const ok = await copyText(text);
    if (!ok) {
      setError(lastError || "Copy gagal.");
      return;
    }
    showToast("Pesan berhasil dicopy.");
  };

  const copyLink = async (link: string) => {
    const ok = await copyText(link);
    if (!ok) {
      setError(lastError || "Copy gagal.");
      return;
    }
    showToast("Link berhasil dicopy.");
  };

  return (
    <main className="app-wrapper">
      <AppHeader />
      <InstructionsCard />
      <CsvInputCard />
      <TemplateCard />

      {error ? (
        <div className="error-box" role="alert">
          ⚠ {error}
        </div>
      ) : null}

      {isParsing ? <div className="helper-text">Memproses CSV…</div> : null}

      <button className="generate-btn" type="button" onClick={generate}>
        <span>✦</span> Generate Pesan <span>✦</span>
      </button>

      {generated.length ? (
        <div>
          <div className="results-header">
            <span>Hasil Generate</span>
            <span className="results-count">{generated.length} pesan</span>
          </div>

          {generated.map((g, idx) => (
            <div
              key={`${g.phone}-${idx}`}
              className={`message-item${clickedLinks[g.link] ? " clicked" : ""}`}
              data-clicked={clickedLinks[g.link] ? "true" : "false"}
            >
              <div className="message-left">
                <div className="message-name">{g.name || "(tanpa nama)"}</div>
                <div className="tooltip-wrap">
                  <div className="message-preview">{g.message}</div>
                  <div className="tooltip">{g.message}</div>
                </div>
                <div className="message-phone">{g.phone}</div>
                <div
                  className="placeholder-tags"
                  style={{ marginTop: "0.4rem" }}
                >
                  <button
                    type="button"
                    className="tag"
                    onClick={() => copyMessage(g.message)}
                  >
                    Copy Pesan
                  </button>
                  <button
                    type="button"
                    className="tag"
                    onClick={() => copyLink(g.link)}
                  >
                    Copy Link
                  </button>
                </div>
              </div>
              <a
                href={g.link}
                target="_blank"
                rel="noopener noreferrer"
                className="wa-btn"
                onClick={() => markClicked(g.link)}
              >
                Kirim Pesan
              </a>
            </div>
          ))}
        </div>
      ) : null}

      <div className="footer">
        <StarOrnament size={16} /> Semoga bermanfaat dan berkah{" "}
        <StarOrnament size={16} />
      </div>

      <Toast
        open={toast.open}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </main>
  );
}
