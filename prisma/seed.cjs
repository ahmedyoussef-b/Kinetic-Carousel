// prisma/seed.cjs
const { PrismaClient } = require('@prisma/client');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Configurez les informations d'identification du service account Firebase
// Assurez-vous que les variables d'environnement sont définies
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialisez Firebase Admin
const admin = initializeApp({
  credential: cert(serviceAccount),
});

async function main() {
  console.log('🌱 Démarrage du processus de seeding...');
  
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // --- Nettoyage ---
  console.log('🧹 Nettoyage des données existantes...');
  try {
    const userRecords = await admin.auth().listUsers(1000);
    const uidsToDelete = userRecords.users.map(u => u.uid);
    if (uidsToDelete.length > 0) {
      await admin.auth().deleteUsers(uidsToDelete);
      console.log(`🔥 ${uidsToDelete.length} utilisateurs Firebase supprimés.`);
    }

    // L'ordre est important à cause des contraintes de clé étrangère
    await prisma.notification.deleteMany({});
    await prisma.userPresence.deleteMany({});
    await prisma.result.deleteMany({});
    await prisma.assignment.deleteMany({});
    await prisma.exam.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.teacherAssignment.deleteMany({});
    await prisma.lessonRequirement.deleteMany({});
    await prisma.subjectRequirement.deleteMany({});
    await prisma.teacherConstraint.deleteMany({});
    await prisma.announcement.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.parent.deleteMany({});
    await prisma.teacher.deleteMany({});
    await prisma.admin.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.classroom.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.grade.deleteMany({});
    await prisma.user.deleteMany({});
    
  } catch (error) {
    if (error.code === 'auth/internal-error' && error.message.includes('Error getting users')) {
      console.warn('⚠️ Avertissement lors du nettoyage Firebase (peut ignorer sans risque):', error.message);
    } else {
      console.error('❌ Erreur lors du nettoyage:', error);
      throw error;
    }
  }
  console.log('✅ Nettoyage terminé.');


  // --- Création des Entités de Base ---
  console.log('🏫 Création des niveaux...');
  const grades = await prisma.grade.createManyAndReturn({
    data: [{ level: 7 }, { level: 8 }, { level: 9 }],
  });
  console.log('✅ Niveaux créés.');

  console.log('🏢 Création des salles...');
  const classrooms = await prisma.classroom.createManyAndReturn({
    data: [
      { name: 'Salle 101', capacity: 30, building: 'A' },
      { name: 'Salle 102', capacity: 30, building: 'A' },
      { name: 'Labo Physique', capacity: 25, building: 'B' },
      { name: 'Labo Info', capacity: 25, building: 'B' },
    ],
  });
  console.log('✅ Salles créées.');

  console.log('📚 Création des matières...');
  const subjects = await prisma.subject.createManyAndReturn({
    data: [
      { name: 'Mathématiques', weeklyHours: 4, coefficient: 2 },
      { name: 'Physique-Chimie', weeklyHours: 3, coefficient: 1.5 },
      { name: 'Français', weeklyHours: 4, coefficient: 2 },
      { name: 'Anglais', weeklyHours: 3, coefficient: 1 },
      { name: 'Histoire-Géographie', weeklyHours: 3, coefficient: 1 },
      { name: 'Informatique', weeklyHours: 2, coefficient: 1 },
    ],
  });
  console.log('✅ Matières créées.');
  
  // --- Création des Utilisateurs ---
  
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
      password: hashedPassword, // Utilisation du mot de passe haché
    },
  });
  await prisma.admin.create({ data: { userId: adminUser.id, name: 'Admin', surname: 'User' } });
  console.log('✅ Administrateur créé.');
  
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
      password: hashedPassword,
    },
  });
  await prisma.teacher.create({
    data: {
      userId: teacherUser.id,
      name: 'Prof',
      surname: 'Mathématiques',
      subjects: {
        connect: [{ id: subjects.find(s => s.name === 'Mathématiques')?.id }],
      },
    },
  });
  console.log('✅ Professeur créé.');

  console.log('Classe et élève pour les tests...');
  const testClass = await prisma.class.create({
    data: {
        name: '7ème Année - A',
        abbreviation: '7A',
        capacity: 25,
        gradeId: grades.find(g => g.level === 7)?.id,
    }
  });

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
      password: hashedPassword,
    },
  });
  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      name: 'Élève 1',
      surname: '1A',
      classId: testClass.id,
      gradeId: grades.find(g => g.level === 7)?.id,
    },
  });

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
      password: hashedPassword,
    },
  });
  await prisma.parent.create({
    data: {
      userId: parentUser.id,
      name: 'Parent',
      surname: 'Élève 1 1A',
      students: { connect: [{ id: student.id }] },
    },
  });

  console.log('✅ Classe, élève et parent de test créés.');
  console.log('🎉 Seeding terminé avec succès !');
}

main()
  .catch(async (e) => {
    console.error('❌ Une erreur est survenue lors du seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
