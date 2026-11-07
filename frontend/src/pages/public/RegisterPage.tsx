import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Brain, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/api/authApi';
import Button from '@/components/ui/Button';
import type { UserRole } from '@/types';

interface RegisterForm {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  phone?: string;
}

const ROLES = [
  { value: 'student',   label: '🎓 Student',    desc: 'Learn abacus and take exams' },
  { value: 'teacher',   label: '👩‍🏫 Teacher',   desc: 'Manage students and create exams' },
  { value: 'organizer', label: '🏆 Organizer',   desc: 'Create and manage competitions' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    defaultValues: { role: 'student' }
  });
  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await authApi.register({ full_name: data.full_name, email: data.email, password: data.password, role: data.role, phone: data.phone });
      toast.success('Account created! Please sign in. 🎉');
      navigate('/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Registration failed.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-xl mx-auto mb-2.5 bg-white border-2 border-primary-200 p-1">
              <img
                src="/logo.jpg"
                alt="Brain Breakers Academy Logo"
                className="w-full h-full object-cover object-bottom rounded-2xl"
              />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-1.5 leading-none">
            <span className="text-xl font-black text-[#156e3b]">BRAIN</span>
            <span className="text-xl font-black text-[#ff781f]">BREAKERS</span>
          </div>
          <p className="text-[10px] font-black tracking-widest text-[#156e3b] uppercase mt-0.5">
            Academy
          </p>
          <p className="text-gray-500 text-xs mt-1">Enroll at Brain Breakers Academy</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-primary-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="form-label">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <label key={r.value} className={`relative cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${selectedRole === r.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'}`}>
                    <input type="radio" value={r.value} {...register('role')} className="sr-only" />
                    <div className="text-lg mb-1">{r.label.split(' ')[0]}</div>
                    <div className="text-xs font-semibold text-navy-800">{r.label.split(' ').slice(1).join(' ')}</div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Full Name</label>
              <input type="text" placeholder="Your Full Name" className="form-input"
                {...register('full_name', { required: 'Full name is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input type="email" placeholder="your@email.com" className="form-input"
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="form-label">Phone (Optional)</label>
              <input type="tel" placeholder="+91 9876543210" className="form-input" {...register('phone')} />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 digit" className="form-input pr-10"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'At least 8 characters' },
                    pattern: { value: /(?=.*[A-Z])(?=.*\d)/, message: 'Need 1 uppercase + 1 digit' }
                  })} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <input type={showPass ? 'text' : 'password'} placeholder="Repeat password" className="form-input"
                {...register('confirmPassword', { required: 'Please confirm your password' })} />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-800">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

