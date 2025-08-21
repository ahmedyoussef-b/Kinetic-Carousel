// src/components/auth/LoginForm.tsx
'use client';

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation } from '@/lib/redux/api/authApi';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import FormError from '@/components/forms/FormError';
import { loginSchema } from '@/lib/formValidationSchemas';

type LoginFormValues = z.infer<typeof loginSchema>;
import SocialSignInButtons from './SocialSignInButtons';


export default function LoginForm() {
  console.log("🎨 [LoginForm] Le composant est en cours de rendu.");
  const router = useRouter();
  const { toast } = useToast();
  const [login, { isLoading, isSuccess, isError, data: loginSuccessData, error: loginErrorData }] = useLoginMutation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isSuccess && loginSuccessData) {
        console.log("✅ [LoginForm] Connexion réussie. Redirection vers /dashboard...");
        toast({
          title: "Connexion réussie!",
          description: "Vous allez être redirigé vers votre tableau de bord."
        });
        // Redirect to the central dashboard page, which will handle role-based redirection.
        router.push('/dashboard');
    }
    if (isError) {
      const apiError = loginErrorData as any;
      console.error("❌ [LoginForm] Échec de la connexion :", apiError?.data?.message);
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description: apiError?.data?.message || "Veuillez vérifier vos identifiants."
      });
    }
  }, [isSuccess, isError, loginSuccessData, loginErrorData, router, toast]);

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    console.log("➡️ [LoginForm] Le formulaire est soumis avec les données:", data.email);
    await login(data);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="neumorphic-container">
          <input
            id="email"
            type="text"
            required
            autoComplete="email"
            placeholder=" " 
            {...register('email')}
            disabled={isLoading}
            className="neumorphic-input"
          />
           <label htmlFor="email" className="neumorphic-label">Email ou nom d'utilisateur</label>
        </div>
        <FormError error={errors.email} className="pl-4" />
        
        <div className="neumorphic-container">
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder=" "
            {...register('password')}
            disabled={isLoading}
            className="neumorphic-input"
          />
          <label htmlFor="password" className="neumorphic-label">Mot de passe</label>
        </div>
        <FormError error={errors.password} className="pl-4"/>
        
        <div className="text-right">
             <Link href="/forgot-password" passHref>
                  <span className="text-xs text-blue-500 hover:underline">Mot de passe oublié ?</span>
              </Link>
        </div>

        <div className="btn">
            <button type="submit" className="button" disabled={isLoading}>
              <span>{isLoading ? 'Chargement...' : 'Se Connecter'}</span>
            </button>
            <Link href="/register" className="button">
                <span>Inscrivez-vous</span>
            </Link>
        </div>
      </form>
      <SocialSignInButtons />
    </div>
  );
}
