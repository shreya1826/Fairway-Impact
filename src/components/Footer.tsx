export default function Footer() {
  return (
    <footer className="border-t border-ink/10 px-6 py-10 text-sm text-ink/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <p>© {new Date().getFullYear()} Fairway Impact. Every round counts.</p>
        <p>Built for golfers who'd rather give than gloat.</p>
      </div>
    </footer>
  );
}
