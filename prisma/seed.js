
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

async function cleanupDatabase(auth) {
    console.log('🧹 Nettoyage de la base de données Prisma...');

    // Delete in reverse order of dependency to avoid foreign key constraints
    const tableNames = [
        'ChatroomMessage', 'SessionParticipant', 'ChatroomSession', 'Result',
        'Assignment', 'Exam', 'Attendance', 'Lesson', 'Announcement', 'Event',
        'Student', 'Parent', 'Teacher', 'Admin',
        'Class', 'Grade', 'Subject', 'Classroom', 'User'
    ];

    for (const table of tableNames) {
        try {
            await prisma[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany({});
        } catch (e) {
            console.log(`Pas de données à supprimer dans la table ${table}.`);
        }
    }
    
    console.log('✅ Nettoyage de la base de données Prisma terminé.');

    console.log('🔥 Nettoyage des utilisateurs Firebase de test...');
    try {
        const listUsersResult = await auth.listUsers(1000);
        const uidsToDelete = listUsersResult.users
            .filter(user => user.email.endsWith('@example.com'))
            .map(user => user.uid);
        
        if (uidsToDelete.length > 0) {
            await auth.deleteUsers(uidsToDelete);
            console.log(`🔥 ${uidsToDelete.length} utilisateurs Firebase de test supprimés.`);
        } else {
            console.log('🔥 Aucun utilisateur Firebase de test à supprimer.');
        }
    } catch (error) {
        console.error('🔥 Erreur lors de la suppression des utilisateurs Firebase:', error);
    }
     console.log('✅ Nettoyage Firebase terminé.');
}


async function createFirebaseUser(auth, email, password, displayName) {
    console.log(`   -> Création de l'utilisateur Firebase pour ${email}...`);
    return auth.createUser({
        email,
        password,
        displayName,
        disabled: false
    });
}


async function main() {
  console.log('🌱 Début du peuplement de la base de données...');
  initializeFirebaseAdmin();
  const auth = admin.auth();
  
  await cleanupDatabase(auth);

  // --- Create Admin User ---
  const adminUser = await createFirebaseUser(auth, 'admin@example.com', 'password123', 'Admin Principal');
  const admin1 = await prisma.user.create({
    data: {
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
  await prisma.admin.create({ data: { userId: admin1.id, name: 'Admin', surname: 'Principal' } });
  
  // --- Create Parent User ---
  const parentUser = await createFirebaseUser(auth, 'parent@example.com', 'password123', 'Parent Exemple');
  const parentLocalUser = await prisma.user.create({
    data: {
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
  const parent = await prisma.parent.create({
    data: {
      userId: parentLocalUser.id,
      name: 'Parent',
      surname: 'Exemple',
      phone: '123456789',
      address: '123 Rue Exemple'
    }
  });
  console.log('✅ Utilisateurs principaux créés.');


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
      const displayName = `Prof ${subject.name}`;
      
      const fbTeacher = await createFirebaseUser(auth, teacherEmail, 'password123', displayName);

      const teacherUser = await prisma.user.create({
          data: {
              id: fbTeacher.uid,
              email: teacherEmail,
              username: teacherName.toLowerCase(),
              name: displayName,
              role: 'TEACHER',
              active: true,
              firstName: 'Prof',
              lastName: subject.name,
          }
      });
      const teacher = await prisma.teacher.create({
          data: {
              userId: teacherUser.id,
              name: 'Prof',
              surname: subject.name,
              subjects: { connect: { id: subject.id } }
          }
      });
      teachers.push(teacher);
  }
  console.log(`✅ ${teachers.length} professeurs créés.`);
  
  // --- Create Grades, Classes, and Students ---
  for (let level = 1; level <= 4; level++) {
    console.log(`🏫 Traitement du niveau ${level}...`);
    const grade = await prisma.grade.create({ data: { level } });

    const className = `${level}ème A`;
    const newClass = await prisma.class.create({
      data: { name: className, abbreviation: `${level}A`, capacity: 10, gradeId: grade.id }
    });
    console.log(`  - Classe créée : ${className}`);

    for (let i = 1; i <= 10; i++) {
        const studentName = `eleve_${level}a_${i}`;
        const studentEmail = `${studentName.toLowerCase()}@example.com`;
        const displayName = `Élève ${i} ${level}A`;

        const fbStudent = await createFirebaseUser(auth, studentEmail, 'password123', displayName);
        
        const studentUser = await prisma.user.create({
            data: {
                id: fbStudent.uid,
                email: studentEmail,
                username: studentName.toLowerCase(),
                name: displayName,
                role: 'STUDENT',
                active: true,
                firstName: 'Élève',
                lastName: `${i} ${level}A`,
            }
        });
        await prisma.student.create({
            data: {
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
    await prisma.classroom.create({ data: { name: `Salle ${100 + i}`, capacity: 30 } });
    totalRooms++;
  }
  await prisma.classroom.create({ data: { name: 'Labo Physique', capacity: 20 } }); totalRooms++;
  await prisma.classroom.create({ data: { name: 'Labo Technique', capacity: 20 } }); totalRooms++;
  await prisma.classroom.create({ data: { name: 'Labo Sciences', capacity: 20 } }); totalRooms++;
  await prisma.classroom.create({ data: { name: 'Gymnase', capacity: 40 } }); totalRooms++;
  
  console.log(`✅ ${totalRooms} salles et laboratoires créés.`);

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


    
