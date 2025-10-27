"use client"
import { useState } from "react";
// import { SignIn } from "../ui/signin-google/signin-google";
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
// import Swal from 'sweetalert2';

export function FormLogin(){
  const [errorUsuario, setErrorUsuario] = useState('');
  const [errorContra, setErrorContra] = useState('');
  const [strUsuario, setUsuario] = useState("");
  const [strContra, setContra] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function esperar(ms:any) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorUsuario('');
    setErrorContra('');
    let hasError = false;

    if (!strUsuario.trim()) {
      setErrorUsuario('El usuario es obligatorio');
      hasError = true;
    }
  
    if (!strContra.trim()) {
      setErrorContra('La contraseña es obligatoria');
      hasError = true;
    }
  
    if (hasError) return;
  
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ strUsuario, strContra })
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrorContra(errorData.error || 'Error al iniciar sesión');
        setIsLoading(false);
        return;
      }
  
      const data = await res.json();

      if (data.error) {
        setErrorContra(data.error);
        setIsLoading(false);
        return;
      } 
      
      await esperar(1500);
      router.push("/dashboard");
    
    } catch (err) {
      console.error("Error al hacer login:", err);
      setErrorContra("Hubo un problema al iniciar sesión");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-0">
          {/* Panel izquierdo - Imagen */}
          <div className="hidden lg:flex relative overflow-hidden rounded-l-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 bg-black/20"></div>
            {/* Patrón decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
            </div>
            
            <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
              {/* Logo/Brand */}
              <div>
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold mb-4">
                  Bienvenido a tu<br />tienda online
                </h2>
                <p className="text-slate-300 text-lg">
                  Gestiona tu e-commerce de manera eficiente y moderna.
                </p>
              </div>

              {/* Ilustración central */}
              <div className="flex items-center justify-center my-8">
                <div className="relative w-64 h-64">
                  {/* Círculos decorativos */}
                  <div className="absolute inset-0 bg-white/5 rounded-full animate-pulse"></div>
                  <div className="absolute inset-8 bg-white/10 rounded-full"></div>
                  <div className="absolute inset-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <p className="text-slate-300">Dashboard completo y analíticas</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <p className="text-slate-300">Gestión de productos e inventario</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <p className="text-slate-300">Seguimiento de ventas en tiempo real</p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Formulario */}
          <div className="flex items-center justify-center p-6 lg:p-12 bg-white lg:rounded-r-3xl shadow-xl">
            <div className="w-full max-w-md">
              {/* Logo móvil */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>

              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Iniciar Sesión
                </h1>
                <p className="text-slate-500">
                  Ingresa tus credenciales para continuar
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Campo Usuario */}
                <div className="space-y-2">
                  <label htmlFor="strUsuario" className="block text-sm font-semibold text-slate-700">
                    Usuario
                  </label>
                  <input
                    type="text"
                    id="strUsuario"
                    value={strUsuario}
                    onChange={(e) => {
                      setUsuario(e.target.value);
                      setErrorUsuario('');
                    }}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errorUsuario 
                        ? 'border-red-300 ring-2 ring-red-100 bg-red-50' 
                        : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900 focus:bg-white'
                    }`}
                    placeholder="correo@ejemplo.com"
                    disabled={isLoading}
                  />
                  {errorUsuario && (
                    <p className="text-xs text-red-600 flex items-center gap-1.5 mt-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errorUsuario}
                    </p>
                  )}
                </div>

                {/* Campo Contraseña */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="strContra" className="block text-sm font-semibold text-slate-700">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="strContra"
                      value={strContra}
                      onChange={(e) => {
                        setContra(e.target.value);
                        setErrorContra('');
                      }}
                      className={`w-full px-4 py-3 pr-12 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${
                        errorContra 
                          ? 'border-red-300 ring-2 ring-red-100 bg-red-50' 
                          : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900 focus:bg-white'
                      }`}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errorContra && (
                    <p className="text-xs text-red-600 flex items-center gap-1.5 mt-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errorContra}
                    </p>
                  )}
                </div>

                {/* Botón Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                {/* <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-xs text-slate-500 font-medium">O continúa con</span>
                </div> */}
              </div>

              {/* Google Sign In */}
              {/* <button
                type="button"
                disabled={isLoading}
                className="w-full border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button> */}

              {/* Footer */}
              {/* <p className="text-center text-sm text-slate-600 mt-8">
                ¿No tienes cuenta?{' '}
                <button 
                  type="button" 
                  className="text-slate-900 font-semibold hover:underline"
                >
                  Regístrate aquí
                </button>
              </p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}