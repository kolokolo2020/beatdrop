import { connection } from "next/server";
import { isAdmin, passwordConfigured } from "@/lib/auth";
import { USE_BLOB } from "@/lib/config";
import { listPacks } from "@/lib/packs";
import { logout } from "./actions";
import CopyLink from "./CopyLink";
import DeleteButton from "./DeleteButton";
import LoginForm from "./LoginForm";
import Uploader from "./Uploader";

export default async function Home() {
  await connection();
  if (!passwordConfigured()) {
    return (
      <main className="wrap">
        <p className="eyebrow">Setup</p>
        <h1>Set a password</h1>
        <p className="muted">
          Add an <code className="mono">UPLOAD_PASSWORD</code> environment variable, then redeploy.
        </p>
      </main>
    );
  }

  if (!(await isAdmin())) {
    return (
      <main className="wrap" style={{ maxWidth: 400 }}>
        <p className="eyebrow">Uploads</p>
        <h1>Sign in</h1>
        <LoginForm />
      </main>
    );
  }

  const packs = await listPacks();

  return (
    <main className="wrap stack">
      <div className="spread">
        <div>
          <p className="eyebrow">Uploads</p>
          <h1 style={{ margin: 0 }}>Your packs</h1>
        </div>
        <form action={logout}><button className="btn small">Sign out</button></form>
      </div>
      {!USE_BLOB && (
        <p className="muted small">Local mode: files are saved in <code className="mono">.data/</code>. Connect Vercel Blob to go live.</p>
      )}
      <Uploader useBlob={USE_BLOB} />
      <section className="stack" aria-label="Packs">
        {packs.length === 0 && <p className="muted">No packs yet. Upload a few beats above.</p>}
        {packs.map((pack) => (
          <article key={pack.id} className="panel">
            <div className="spread" style={{ alignItems: "flex-start" }}>
              <div style={{ minWidth: 0 }}>
                <a href={`/p/${pack.id}`} target="_blank" rel="noreferrer" style={{ fontWeight: 600, overflowWrap: "anywhere" }}>{pack.title}</a>
                <p className="muted small" style={{ margin: "2px 0 0" }}>
                  {pack.tracks.length} {pack.tracks.length === 1 ? "beat" : "beats"} ·{" "}
                  {new Date(pack.createdAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <CopyLink path={`/p/${pack.id}`} />
              <DeleteButton id={pack.id} title={pack.title} />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
