import { useState } from 'react'
import '../dashboard.css'

const LoginForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="grid min-h-[100dvh] w-full bg-background lg:grid-cols-[1.05fr_1fr]">
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      {/* Brand panel — hidden on mobile, asymmetric split on desktop */}
      <aside
        className="sidebar-grain relative hidden overflow-hidden p-12 xl:p-16 lg:flex lg:flex-col lg:justify-between"
        style={{
          background:
            'linear-gradient(155deg, var(--color-primary-dark) 0%, var(--color-primary) 52%, var(--color-primary-container) 100%)',
        }}
      >
        {/* Single restrained highlight — no neon glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full"
          style={{
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--color-primary-fixed-dim) 18%, transparent), transparent 70%)',
          }}
        />

        <div className="relative flex items-center gap-2.5 text-on-primary">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/12 ring-1 ring-inset ring-white/15">
            <span className="material-symbols-outlined text-[20px]">person_search</span>
          </span>
          <span className="text-[17px] font-extrabold tracking-tight">EmpowerCV</span>
        </div>

        <div className="relative max-w-[26rem]">
          <p className="text-[34px] font-extrabold leading-[1.08] tracking-tight text-on-primary xl:text-[40px]">
            Recrutez sur les signaux, pas sur les CV.
          </p>
          <p className="mt-5 max-w-[24rem] text-[15px] leading-relaxed text-primary-fixed/85">
            Le moteur classe vos candidats par adéquation réelle au poste et livre des
            shortlists prêtes à décider.
          </p>

          {/* Liquid-glass testimonial */}
          <figure className="mt-9 rounded-2xl border border-white/12 bg-white/8 p-5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            <blockquote className="text-[14px] leading-relaxed text-on-primary/90">
              « On a divisé par trois le temps de présélection. Les shortlists arrivent
              déjà classées, on n'arbitre plus que le haut du panier. »
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-fixed/90 text-[13px] font-bold text-on-primary-fixed">
                NB
              </span>
              <span className="text-[13px] leading-tight text-on-primary/80">
                <span className="block font-semibold text-on-primary">Naïma Belkacem</span>
                Lead Talent · Lumio
              </span>
            </figcaption>
          </figure>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[400px]">
          {/* Mobile-only brand mark */}
          <div className="animate-in mb-10 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary">
              <span className="material-symbols-outlined text-[20px]">person_search</span>
            </span>
            <span className="text-[17px] font-extrabold tracking-tight text-on-surface">
              EmpowerCV
            </span>
          </div>

          <header className="animate-in mb-8" style={{ animationDelay: '40ms' }}>
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-on-surface">
              Bon retour parmi nous
            </h1>
            <p className="mt-2 text-[14px] text-on-surface-variant">
              Connectez-vous pour reprendre vos campagnes de recrutement.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="animate-in flex flex-col gap-2" style={{ animationDelay: '90ms' }}>
              <label htmlFor="email" className="text-[13px] font-semibold text-on-surface">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vous@entreprise.com"
                required
                aria-invalid={Boolean(error)}
                className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-[15px] text-on-surface transition-all duration-200 placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div className="animate-in flex flex-col gap-2" style={{ animationDelay: '140ms' }}>
              <div className="flex items-baseline justify-between">
                <label htmlFor="password" className="text-[13px] font-semibold text-on-surface">
                  Mot de passe
                </label>
                <a
                  href="mailto:support@empowercv.com?subject=R%C3%A9initialisation%20du%20mot%20de%20passe"
                  className="rounded text-[12px] font-medium text-primary transition-colors hover:text-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  required
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'login-error' : undefined}
                  className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-4 pr-14 text-[15px] text-on-surface transition-all duration-200 placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-pressed={showPassword}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-primary/6 hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {error ? (
              <div
                id="login-error"
                role="alert"
                className="flex items-start gap-2.5 rounded-xl bg-error-container px-3.5 py-3 text-[13px] leading-snug text-on-error-container"
              >
                <span className="material-symbols-outlined mt-px text-[18px]">error</span>
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              style={{ animationDelay: '190ms' }}
              className="animate-in group mt-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-bold text-on-primary shadow-purple-md transition-all duration-200 hover:bg-primary-container hover:shadow-purple-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Connexion…
                </>
              ) : (
                <>
                  Se connecter
                  <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-0.5">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          <p
            className="animate-in mt-8 text-[13px] text-on-surface-variant"
            style={{ animationDelay: '240ms' }}
          >
            Pas encore d'accès ?{' '}
            <a
              href="mailto:admin@empowercv.com?subject=Demande%20d%27acc%C3%A8s%20EmpowerCV"
              className="rounded font-semibold text-primary transition-colors hover:text-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
            >
              Contactez votre administrateur
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

export default LoginForm
