import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Brain, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authApi.login(data.email, data.password);
      const d = res.data;
      setAuth(
        { id: d.user_id, full_name: d.full_name, email: data.email, role: d.role, is_active: true, created_at: new Date().toISOString() },
        d.access_token,
        d.refresh_token
      );
      toast.success(`Welcome back, ${d.full_name.split(' ')[0]}! 🎉`);
      const redirects: Record<string, string> = {
        student: '/student/dashboard', teacher: '/teacher/dashboard',
        admin: '/admin/dashboard', organizer: '/organizer/dashboard',
      };
      navigate(redirects[d.role] || '/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Login failed. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl mx-auto mb-3 bg-white border-2 border-primary-200 p-1">
              <img
                src="/logo.jpg"
                alt="Brain Breakers Academy Logo"
                className="w-full h-full object-cover object-bottom rounded-2xl"
              />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-1.5 leading-none">
            <span className="text-2xl font-black text-[#156e3b]">BRAIN</span>
            <span className="text-2xl font-black text-[#ff781f]">BREAKERS</span>
          </div>
          <p className="text-xs font-black tracking-widest text-[#156e3b] uppercase mt-1">
            Academy
          </p>
          <p className="text-gray-500 text-xs mt-1 italic">Think Beyond, Learn Beyond</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-primary-100 p-8">
          <h2 className="text-xl font-bold text-navy-900 mb-1">Welcome back!</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to continue your learning journey</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="form-input"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                })}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="form-input pr-10"
                  {...register('password', { required: 'Password is required' })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-800">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Brain Breakers Academy
        </p>
      </div>
    </div>
  );
}

