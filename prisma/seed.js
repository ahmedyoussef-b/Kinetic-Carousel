// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const admin = require('firebase-admin');

const prisma = new PrismaClient();

// --- DATA SETS ---

const subjectsData = [
    { name: 'Mathématiques', weeklyHours: 5, coefficient: 4, isOptional: false },
    { name: 'Physique', weeklyHours: 4, coefficient: 3, isOptional: false },
    { name: 'Sciences', weeklyHours: 3, coefficient: 2, isOptional: false },
    { name: 'Français', weeklyHours: 4, coefficient: 3, isOptional: false },
    { name: 'Arabe', weeklyHours: 4, coefficient: 4, isOptional: false },
    { name: 'Anglais', weeklyHours: 3, coefficient: 2, isOptional: false },
    { name: 'Histoire', weeklyHours: 2, coefficient: 1, isOptional: false },
    { name: 'Géographie', weeklyHours: 2, coefficient: 1, isOptional: false },
    { name: 'Éducation Civile', weeklyHours: 1, coefficient: 1, isOptional: false },
    { name: 'Éducation Religieuse', weeklyHours: 1, coefficient: 1, isOptional: false },
    { name: 'Informatique', weeklyHours: 2, coefficient: 1, isOptional: false },
    { name: 'Technique', weeklyHours: 2, coefficient: 1, isOptional: false },
    { name: 'Musique', weeklyHours: 1, coefficient: 1, isOptional: false },
    { name: 'Art', weeklyHours: 1, coefficient: 1, isOptional: false },
    { name: 'Éducation Sportive', weeklyHours: 2, coefficient: 1, isOptional: false },
];

// --- FIREBASE ADMIN INITIALIZATION ---
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    console.log("🔥 [Seed Script] Initializing Firebase Admin SDK...");
    
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL.replace('@', '%40')}`
    };

    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
      throw new Error('Firebase Admin SDK configuration is missing required environment variables.');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("🔥 [Seed Script] ✅ Admin SDK initialized.");
  }
}

// --- HELPER FUNCTIONS ---

async function cleanupDatabase() {
    console.log('🧹 Nettoyage de la base de données...');

    // Delete in reverse order of dependency to avoid foreign key constraints
    await prisma.chatroomMessage.deleteMany().catch(e => console.log('Pas de messages à supprimer.'));
    await prisma.sessionParticipant.deleteMany().catch(e => console.log('Pas de participants de session à supprimer.'));
    await prisma.chatroomSession.deleteMany().catch(e => console.log('Pas de sessions de chatroom à supprimer.'));
    await prisma.result.deleteMany().catch(e => console.log('Pas de résultats à supprimer.'));
    await prisma.assignment.deleteMany().catch(e => console.log('Pas de devoirs à supprimer.'));
    await prisma.exam.deleteMany().catch(e => console.log('Pas d\'examens à supprimer.'));
    await prisma.attendance.deleteMany().catch(e => console.log('Pas de présences à supprimer.'));
    await prisma.lesson.deleteMany().catch(e => console.log('Pas de leçons à supprimer.'));
    await prisma.announcement.deleteMany().catch(e => console.log('Pas d\'annonces à supprimer.'));
    await prisma.event.deleteMany().catch(e => console.log('Pas d\'événements à supprimer.'));
    await prisma.optionalSubjectGroup.deleteMany().catch(e => console.log('Pas de groupes de matières optionnelles à supprimer.'));
    await prisma.student.deleteMany().catch(e => console.log('Pas d\'étudiants à supprimer.'));
    await prisma.parent.deleteMany().catch(e => console.log('Pas de parents à supprimer.'));
    await prisma.teacher.deleteMany().catch(e => console.log('Pas d\'enseignants à supprimer.'));
    await prisma.admin.deleteMany().catch(e => console.log('Pas d\'admins à supprimer.'));
    await prisma.class.deleteMany().catch(e => console.log('Pas de classes à supprimer.'));
    await prisma.grade.deleteMany().catch(e => console.log('Pas de niveaux à supprimer.'));
    await prisma.subject.deleteMany().catch(e => console.log('Pas de matières à supprimer.'));
    await prisma.classroom.deleteMany().catch(e => console.log('Pas de salles à supprimer.'));
    await prisma.user.deleteMany().catch(e => console.log('Pas d\'utilisateurs à supprimer.'));
    
    console.log('✅ Nettoyage terminé.');
}

async function getOrCreateFirebaseUser(auth, email, password) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    console.log(`   -> Utilisateur Firebase trouvé: ${email} (UID: ${userRecord.uid})`);
    if (userRecord.disabled) {
        console.log(`   -> Utilisateur Firebase est désactivé. Activation...`);
        await auth.updateUser(userRecord.uid, { disabled: false });
    }
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`   -> Utilisateur Firebase non trouvé pour ${email}. Création...`);
      return auth.createUser({
        email: email,
        password: password,
        disabled: false
      });
    }
    throw error;
  }
}

async function main() {
  await cleanupDatabase();

  console.log('🌱 Début du peuplement de la base de données...');
  initializeFirebaseAdmin();
  const auth = admin.auth();

  // --- Get/Create Firebase Admin/Parent Users ---
  console.log('👤 Synchronisation des utilisateurs principaux (Admin, Parent)...');
  const adminUser = await getOrCreateFirebaseUser(auth, 'admin@example.com', 'password123');
  const parentUser = await getOrCreateFirebaseUser(auth, 'parent@example.com', 'password123');
  
  // --- Create/Update Local User Profiles ---
  const admin1 = await prisma.user.upsert({
    where: { id: adminUser.uid },
    update: {},
    create: {
      id: adminUser.uid,
      email: adminUser.email,
      username: 'admin',
      name: 'Admin Principal',
      role: 'ADMIN',
      active: true,
      firstName: 'Admin',
      lastName: 'Principal',
    }
  });
  await prisma.admin.upsert({ where: { userId: admin1.id }, update: {}, create: { userId: admin1.id, name: 'Admin', surname: 'Principal' } });

  const parentLocalUser = await prisma.user.upsert({
    where: { id: parentUser.uid },
    update: {},
    create: {
      id: parentUser.uid,
      email: parentUser.email,
      username: 'parent',
      name: 'Parent Exemple',
      role: 'PARENT',
      active: true,
      firstName: 'Parent',
      lastName: 'Exemple',
    }
  });
  const parent = await prisma.parent.upsert({
    where: { userId: parentLocalUser.id },
    update: {},
    create: {
      userId: parentLocalUser.id,
      name: 'Parent',
      surname: 'Exemple',
      phone: '123456789',
      address: '123 Rue Exemple'
    }
  });
  console.log('✅ Utilisateurs principaux synchronisés.');

  // --- Create Subjects ---
  console.log('📚 Création des matières...');
  const createdSubjects = await Promise.all(
    subjectsData.map(subject => prisma.subject.create({ data: subject }))
  );
  console.log(`✅ ${createdSubjects.length} matières créées.`);

  // --- Create Teachers ---
  console.log('🧑‍🏫 Création des professeurs...');
  const teachers = [];
  for (const subject of createdSubjects) {
      const teacherName = `Prof_${subject.name.replace(/\s+/g, '')}`;
      const teacherEmail = `${teacherName.toLowerCase()}@example.com`;
      
      const fbTeacher = await getOrCreateFirebaseUser(auth, teacherEmail, 'password123');

      const teacherUser = await prisma.user.upsert({
          where: { id: fbTeacher.uid },
          update: {},
          create: {
              id: fbTeacher.uid,
              email: teacherEmail,
              username: teacherName.toLowerCase(),
              name: `Prof ${subject.name}`,
              role: 'TEACHER',
              active: true,
              firstName: 'Prof',
              lastName: subject.name,
          }
      });
      const teacher = await prisma.teacher.upsert({
          where: { userId: teacherUser.id },
          update: {},
          create: {
              userId: teacherUser.id,
              name: 'Prof',
              surname: subject.name,
              subjects: { connect: { id: subject.id } }
          }
      });
      teachers.push(teacher);
  }
  console.log(`✅ ${teachers.length} professeurs créés ou mis à jour.`);
  
  // --- Create Grades, Classes, and Students ---
  for (let level = 1; level <= 4; level++) {
    console.log(`🏫 Traitement du niveau ${level}...`);
    const grade = await prisma.grade.upsert({ where: { level }, update: {}, create: { level } });

    const className = `${level}ème A`;
    const newClass = await prisma.class.create({
      data: { name: className, abbreviation: `${level}A`, capacity: 10, gradeId: grade.id }
    });
    console.log(`  - Classe créée : ${className}`);

    for (let i = 1; i <= 10; i++) {
        const studentName = `eleve_${level}a_${i}`;
        const studentEmail = `${studentName.toLowerCase()}@example.com`;

        const fbStudent = await getOrCreateFirebaseUser(auth, studentEmail, 'password123');
        
        const studentUser = await prisma.user.upsert({
            where: { id: fbStudent.uid },
            update: {},
            create: {
                id: fbStudent.uid,
                email: studentEmail,
                username: studentName.toLowerCase(),
                name: `Élève ${i} ${level}A`,
                role: 'STUDENT',
                active: true,
                firstName: 'Élève',
                lastName: `${i} ${level}A`,
            }
        });
        await prisma.student.upsert({
            where: { userId: studentUser.id },
            update: {},
            create: {
                userId: studentUser.id,
                name: 'Élève',
                surname: `${i} ${level}A`,
                classId: newClass.id,
                gradeId: grade.id,
                parentId: parent.id,
                address: '123 Rue Exemple',
                phone: '123456789',
                birthday: new Date(),
                sex: 'MALE',
                bloodType: 'A+',
            }
        });
    }
     console.log(`✅ Niveau ${level} traité.`);
  }

  // --- Create classrooms ---
  console.log('🚪 Création des salles...');
  let totalRooms = 0;
  for (let i = 1; i <= 10; i++) {
    await prisma.classroom.upsert({ where: {name: `Salle ${100 + i}`}, update: {}, create: { name: `Salle ${100 + i}`, capacity: 30 } });
    totalRooms++;
  }
  await prisma.classroom.upsert({ where: {name: 'Labo Physique'}, update: {}, create: { name: 'Labo Physique', capacity: 20 } }); totalRooms++;
  await prisma.classroom.upsert({ where: {name: 'Labo Technique'}, update: {}, create: { name: 'Labo Technique', capacity: 20 } }); totalRooms++;
  await prisma.classroom.upsert({ where: {name: 'Labo Sciences'}, update: {}, create: { name: 'Labo Sciences', capacity: 20 } }); totalRooms++;
  await prisma.classroom.upsert({ where: {name: 'Gymnase'}, update: {}, create: { name: 'Gymnase', capacity: 40 } }); totalRooms++;
  
  console.log(`✅ ${totalRooms} salles et laboratoires créés ou mis à jour.`);

  console.log('🎉 Peuplement de la base de données terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Une erreur est survenue lors du seeding de la base de données :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
