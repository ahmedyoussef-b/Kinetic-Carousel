// src/components/auth/LoginForm.tsx
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import FormError from '@/components/forms/FormError';
import { loginSchema } from '@/lib/formValidationSchemas';
import SocialSignInButtons from './SocialSignInButtons';

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useLoginMutation } from '@/lib/redux/api/authApi';
import { initializeFirebaseApp } from '@/lib/firebase';
import { useState } from 'react';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loginApi, { isLoading: isApiLoading }] = useLoginMutation();
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);
  const isLoading = isApiLoading || isFirebaseLoading;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsFirebaseLoading(true);
    try {
      const app = initializeFirebaseApp();
      const auth = getAuth(app);
      
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const idToken = await userCredential.user.getIdToken();

      await loginApi({ idToken }).unwrap();
      
      toast({
        title: "Connexion réussie!",
        description: "Vous allez être redirigé vers votre tableau de bord."
      });
      
      // Force a full page reload to allow the middleware to redirect correctly
      window.location.href = '/';

    } catch (error: any) {
      console.error("Login Error:", error);
      const errorMessage = error.data?.message || (error.code === 'auth/invalid-credential' ? 'Email ou mot de passe incorrect.' : "Une erreur est survenue.");
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description: errorMessage,
      });
    } finally {
      setIsFirebaseLoading(false);
    }
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
