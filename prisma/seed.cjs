// prisma/seed.cjs
const { PrismaClient } = require('@prisma/client');
const admin = require('firebase-admin');

const prisma = new PrismaClient();

// Initialisation de Firebase Admin SDK
// Assurez-vous que vos variables d'environnement sont correctement configurées
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error("Les variables d'environnement Firebase Admin SDK ne sont pas définies. Le script de seeding ne peut pas créer d'utilisateurs.");
    process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});


async function main() {
  console.log('🌱 Démarrage du processus de seeding...');

  // --- Nettoyage de la base de données ---
  console.log('🧹 Nettoyage des données existantes...');
  await prisma.userPresence.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.classroom.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.grade.deleteMany({});
  
  // Nettoyage des utilisateurs Firebase (attention en production)
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    const uidsToDelete = listUsersResult.users.map(u => u.uid);
    if (uidsToDelete.length > 0) {
        await admin.auth().deleteUsers(uidsToDelete);
        console.log(`🔥 ${uidsToDelete.length} utilisateurs Firebase supprimés.`);
    }
    await prisma.user.deleteMany({}); // Doit être après Firebase pour éviter les problèmes de contraintes
  } catch(e) {
      console.warn("⚠️ Avertissement : Impossible de lister ou de supprimer les utilisateurs Firebase. Il se peut qu'il n'y en ait aucun. Erreur:", e.message);
  }
  
  console.log('✅ Nettoyage terminé.');

  // --- Création des entités de base ---
  console.log('🏫 Création des niveaux...');
  const grade1 = await prisma.grade.create({ data: { level: 1 } });
  const grade2 = await prisma.grade.create({ data: { level: 2 } });
  console.log('✅ Niveaux créés.');

  console.log('🏢 Création des salles...');
  const classroom1 = await prisma.classroom.create({ data: { name: 'Salle 101', capacity: 30, building: 'A' } });
  const classroom2 = await prisma.classroom.create({ data: { name: 'Salle 102', capacity: 30, building: 'A' } });
  console.log('✅ Salles créées.');

  console.log('📚 Création des matières...');
  const math = await prisma.subject.create({ data: { name: 'Mathématiques', weeklyHours: 4, coefficient: 2 } });
  const french = await prisma.subject.create({ data: { name: 'Français', weeklyHours: 4, coefficient: 2 } });
  console.log('✅ Matières créées.');

  // --- Création des Utilisateurs et Profils ---
  const password = 'password123';

  // Admin
  console.log('👤 Création de l\'administrateur...');
  const adminUserRecord = await admin.auth().createUser({ email: 'admin@example.com', password });
  await admin.auth().setCustomUserClaims(adminUserRecord.uid, { role: 'ADMIN' });
  const adminUser = await prisma.user.create({
    data: {
      id: adminUserRecord.uid,
      email: 'admin@example.com',
      username: 'admin',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      password: password,
    },
  });
  await prisma.admin.create({ data: { userId: adminUser.id, name: 'Admin', surname: 'User' } });
  console.log('✅ Administrateur créé.');

  // Teacher
  console.log('🧑‍🏫 Création du professeur...');
  const teacherUserRecord = await admin.auth().createUser({ email: 'prof_mathématiques@example.com', password });
  await admin.auth().setCustomUserClaims(teacherUserRecord.uid, { role: 'TEACHER' });
  const teacherUser = await prisma.user.create({
    data: {
      id: teacherUserRecord.uid,
      email: 'prof_mathématiques@example.com',
      username: 'prof_mathématiques',
      name: 'Prof Mathématiques',
      firstName: 'Prof',
      lastName: 'Mathématiques',
      role: 'TEACHER',
      password: password,
    },
  });
  await prisma.teacher.create({ 
    data: { 
        userId: teacherUser.id,
        name: 'Prof', 
        surname: 'Mathématiques',
        subjects: { connect: { id: math.id } }
    } 
  });
  console.log('✅ Professeur créé.');

  // Classes (après la création des entités de base)
  console.log('🏫 Création des classes...');
  const class1A = await prisma.class.create({ data: { name: 'Classe 1A', capacity: 25, gradeId: grade1.id, abbreviation: '1A' } });
  const class2B = await prisma.class.create({ data: { name: 'Classe 2B', capacity: 25, gradeId: grade2.id, abbreviation: '2B' } });
  console.log('✅ Classes créées.');

  // Parent and Student
  console.log('👨‍👩‍👧 Création du parent et de l\'étudiant...');
  const parentUserRecord = await admin.auth().createUser({ email: 'parent_eleve_1a_1@example.com', password });
  await admin.auth().setCustomUserClaims(parentUserRecord.uid, { role: 'PARENT' });
  const parentUser = await prisma.user.create({
    data: {
      id: parentUserRecord.uid,
      email: 'parent_eleve_1a_1@example.com',
      username: 'parent_eleve_1a_1',
      name: 'Parent Élève 1 1A',
      firstName: 'Parent',
      lastName: 'Élève 1 1A',
      role: 'PARENT',
      password: password,
    },
  });
  const parentProfile = await prisma.parent.create({ data: { userId: parentUser.id, name: 'Parent', surname: 'Élève 1 1A', address: '' } });
  
  const studentUserRecord = await admin.auth().createUser({ email: 'eleve_1a_1@example.com', password });
  await admin.auth().setCustomUserClaims(studentUserRecord.uid, { role: 'STUDENT' });
  const studentUser = await prisma.user.create({
    data: {
      id: studentUserRecord.uid,
      email: 'eleve_1a_1@example.com',
      username: 'eleve_1a_1',
      name: 'Élève 1 1A',
      firstName: 'Élève 1',
      lastName: '1A',
      role: 'STUDENT',
      password: password,
    },
  });
  await prisma.student.create({
    data: {
      userId: studentUser.id,
      name: 'Élève 1',
      surname: '1A',
      classId: class1A.id,
      gradeId: grade1.id,
      parentId: parentProfile.id,
    },
  });
  console.log('✅ Parent et étudiant créés.');


  console.log('🎉 Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
