export default function Footer() {
  return (
    <footer id="contact" className="relative border-t border-white/5 pt-16 pb-8 px-4 sm:px-6">
      {/* Rainbow line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Agenda LGBT" className="w-8 h-8 rounded-xl object-contain bg-white" />
              <span className="font-bold text-lg">
                <span className="rainbow-text">Agenda</span>
                <span className="text-white ml-1">LGBT</span>
              </span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs">
              L'application communautaire qui réunit tous les événements LGBT+ de France et Belgique.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white/60 text-xs uppercase tracking-widest mb-4">
              Navigation
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "Accueil", href: "#" },
                { label: "L'application", href: "#app" },
                { label: "Pays couverts", href: "#pays" },
                { label: "Nous contacter", href: "mailto:contact@agendalgbt.fr" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-white/40 hover:text-white/80 text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Social & Download */}
          <div>
            <h4 className="text-white/60 text-xs uppercase tracking-widest mb-4">
              Suivre Agenda LGBT
            </h4>
            <div className="flex gap-3 mb-6">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/agenda_lgbt/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all group"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>

            <a
              href="mailto:hello@agendalgbt.com"
              className="text-white/40 hover:text-white/80 text-sm transition-colors flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              hello@agendalgbt.com
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs text-center sm:text-left">
            © 2026 Agenda LGBT. Tous droits réservés. Fait avec 🏳️‍🌈 pour la communauté.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">
              Mentions légales
            </a>
            <a href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">
              Confidentialité
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
