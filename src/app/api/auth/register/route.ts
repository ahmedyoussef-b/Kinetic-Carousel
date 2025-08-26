// src/app/api/auth/register/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma, Role } from '@prisma/client';
import { registerSchema } from '@/lib/formValidationSchemas';
import type { SafeUser } from '@/types';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, role, name } = body;

    if (!idToken || !role || !name) {
        return NextResponse.json({ message: "Données d'inscription incomplètes." }, { status: 400 });
    }

    initializeFirebaseAdmin();
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    
    const { uid, email } = decodedToken;
    const finalName = name || (role === Role.TEACHER ? 'Nouvel Enseignant' : 'Nouveau Parent');
    const [firstName, ...lastNameParts] = finalName.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Un utilisateur avec cet email existe déjà." }, { status: 409 });
    }

    const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                id: uid, // Use Firebase UID as the primary key
                email: email!,
                username: email!, // Default username to email
                role,
                name: finalName,
                firstName: firstName,
                lastName: lastName,
                active: true, // Activate account upon registration
            }
        });

        // Create the corresponding role profile
        if (role === Role.TEACHER) {
            await tx.teacher.create({ data: { userId: user.id, name: firstName, surname: lastName } });
        } else if (role === Role.PARENT) {
            await tx.parent.create({ data: { userId: user.id, name: firstName, surname: lastName } });
        }
        
        return user;
    });
    
    // Set custom claim for role
    await auth.setCustomUserClaims(uid, { role });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = newUser;

    return NextResponse.json({ user: safeUser as SafeUser }, { status: 201 });

  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return NextResponse.json({ message: "Un utilisateur avec cet email ou nom d'utilisateur existe déjà." }, { status: 409 });
    }
    return NextResponse.json({ message: "Une erreur interne est survenue." }, { status: 500 });
  }
}