// src/app/api/auth/register/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Prisma, Role } from '@prisma/client';
import { registerSchema } from '@/lib/formValidationSchemas';
import type { SafeUser } from '@/types';

const HASH_ROUNDS = 10;

export async function POST(req: NextRequest) {
  console.log("--- 🚀 API: Tentative d'Inscription ---");
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      console.log("🚫 [API/register] Données d'inscription invalides.", validation.error.errors);
      return NextResponse.json({ message: "Données d'inscription invalides.", errors: validation.error.errors }, { status: 400 });
    }

    const { email, password, role, name } = validation.data;
    console.log(`👤 [API/register] Tentative d'inscription pour: ${email}`);
    
    // Default name if not provided
    const finalName = name || (role === Role.TEACHER ? 'Nouvel Enseignant' : 'Nouveau Parent');
    const [firstName, ...lastNameParts] = finalName.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      console.log("🚫 [API/register] Un utilisateur avec cet email existe déjà.");
      return NextResponse.json({ message: "Un utilisateur avec cet email existe déjà." }, { status: 409 });
    }
    
    const hashedPassword = await bcrypt.hash(password, HASH_ROUNDS);
    console.log("🔑 [API/register] Mot de passe haché.");

    const newUser = await prisma.$transaction(async (tx) => {
        console.log("📦 [API/register] Démarrage de la transaction pour créer l'utilisateur et le profil.");
        const user = await tx.user.create({
            data: {
                email,
                username: email, // Default username to email
                password: hashedPassword,
                role,
                name: finalName,
                firstName: firstName,
                lastName: lastName,
                active: true, // Activate account upon registration
            }
        });

        // Create the corresponding role profile
        if (role === Role.TEACHER) {
            await tx.teacher.create({
                data: {
                    userId: user.id,
                    name: firstName,
                    surname: lastName,
                }
            });
             console.log("🧑‍🏫 [API/register] Profil enseignant créé.");
        } else if (role === Role.PARENT) {
            await tx.parent.create({
                data: {
                    userId: user.id,
                    name: firstName,
                    surname: lastName,
                }
            });
            console.log("👨‍👩‍👧 [API/register] Profil parent créé.");
        }
        
        return user;
    });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = newUser;

    console.log("✅ [API/register] Inscription réussie.");
    return NextResponse.json({ user: safeUser as SafeUser }, { status: 201 });

  } catch (error) {
    console.error("❌ [API/register] Erreur lors de l'inscription:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return NextResponse.json({ message: "Un utilisateur avec cet email ou nom d'utilisateur existe déjà." }, { status: 409 });
    }
    return NextResponse.json({ message: "Une erreur interne est survenue." }, { status: 500 });
  }
}
