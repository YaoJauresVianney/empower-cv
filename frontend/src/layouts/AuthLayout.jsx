import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <main className="auth-layout">
      <section className="card">
        <Outlet />
      </section>
    </main>
  )
}

export default AuthLayout
