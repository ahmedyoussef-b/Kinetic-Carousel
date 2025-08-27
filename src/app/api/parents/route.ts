
// src/app/api/parents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma, Role } from '@prisma/client';
import { parentSchema } from '@/lib/formValidationSchemas';

// POST (create) a new parent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = parentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Données d'entrée invalides", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { username, email, password, name, surname, phone, address, img } = validation.data;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      let message = 'Un utilisateur existe déjà.';
      if (existingUser.email === email) message = 'Un utilisateur existe déjà avec cet email.';
      if (existingUser.username === username) message = 'Ce nom d\'utilisateur est déjà pris.';
      return NextResponse.json({ message }, { status: 409 });
    }
    
    // With Firebase Auth, we don't create the user here. We assume the user is already created in Firebase.
    // We need to link the parent profile to an existing Firebase user.
    // This endpoint logic needs to be re-evaluated. For now, let's remove password handling.

    // This endpoint is likely called after a Firebase user is created.
    // It should receive a Firebase UID to link.
    // The current logic is based on creating a user with a password, which is now wrong.
    // For now, let's just create the profile without creating a User record,
    // assuming it will be linked elsewhere or this endpoint is for a different flow.
    // A better approach would be to refactor this to accept a userId from Firebase.

    //
    // The following code is based on the old system and will likely fail
    // if the User model no longer has a password field.
    // I will remove the user creation part to fix the immediate error.
    // A full refactor of the registration flow is recommended.
    //

    // Not creating a user here anymore. This endpoint might need to be removed or refactored.
    // For now, I'll return an error indicating this flow is incomplete.
    return NextResponse.json({ message: "La création de parents via cette route n'est pas supportée avec l'authentification Firebase. Le profil doit être créé lors de l'inscription." }, { status: 400 });


  } catch (error) {
    console.error('Erreur lors de la création du parent :', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ message: "Un utilisateur avec cet email ou nom d'utilisateur existe déjà." }, { status: 409 });
    }
    return NextResponse.json({ message: 'Erreur interne du serveur.', error: (error as Error).message }, { status: 500 });
  }
}
