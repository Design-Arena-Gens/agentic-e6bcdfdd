export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-12 px-6 py-16 sm:px-10 lg:px-16">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            WhatsApp Automation
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Order & Inventory Assistant
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Respond to customer messages instantly. This WhatsApp bot checks
            live data in Google Sheets to deliver order statuses and inventory
            availability in seconds.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">
              Connect in Three Steps
            </h2>
            <ol className="space-y-4 text-slate-300">
              <li>
                <span className="font-semibold text-emerald-400">1.</span>{" "}
                Share your Google Sheets ID, service account email, and private
                key as environment variables.
              </li>
              <li>
                <span className="font-semibold text-emerald-400">2.</span>{" "}
                Point your Twilio WhatsApp sandbox or business number webhook to{" "}
                <code className="rounded bg-slate-800 px-2 py-1 text-sm">
                  /api/whatsapp
                </code>{" "}
                on this deployment.
              </li>
              <li>
                <span className="font-semibold text-emerald-400">3.</span>{" "}
                Use the sample sheets (Orders &amp; Inventory tabs) or map to
                your live data.
              </li>
            </ol>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/30 p-8">
            <h3 className="text-xl font-semibold">Sample Commands</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="rounded-xl bg-slate-950/40 p-4">
                <p className="font-semibold text-emerald-300">Order lookup</p>
                <p className="font-mono text-slate-200">order 12345</p>
                <p>Status, customer, and last update for the order.</p>
              </div>
              <div className="rounded-xl bg-slate-950/40 p-4">
                <p className="font-semibold text-emerald-300">
                  Inventory check
                </p>
                <p className="font-mono text-slate-200">inventory SKU-1002</p>
                <p>Quantity on hand plus restock threshold.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
          <h2 className="text-2xl font-semibold text-white">
            Google Sheets Setup
          </h2>
          <div className="mt-5 grid gap-6 text-sm text-slate-300 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-100">
                Orders tab (default: &quot;Orders&quot;)
              </h3>
              <ul className="space-y-1">
                <li>Order ID</li>
                <li>Customer</li>
                <li>Status</li>
                <li>Updated At (optional)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-100">
                Inventory tab (default: &quot;Inventory&quot;)
              </h3>
              <ul className="space-y-1">
                <li>SKU</li>
                <li>Name</li>
                <li>Quantity</li>
                <li>Restock Level (optional)</li>
              </ul>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Customize tab names with{" "}
            <code className="rounded bg-slate-800 px-2 py-1">
              GOOGLE_SHEETS_ORDER_TAB
            </code>{" "}
            and{" "}
            <code className="rounded bg-slate-800 px-2 py-1">
              GOOGLE_SHEETS_INVENTORY_TAB
            </code>
            .
          </p>
        </section>
        <footer className="border-t border-slate-800/70 pt-6 text-sm text-slate-500">
          Deploy to Vercel and link your WhatsApp number via Twilio to make the
          assistant live for customers.
        </footer>
      </div>
    </div>
  );
}
