
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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

const optionalSubjectsData = [
    { name: 'Allemand', weeklyHours: 2, coefficient: 1, isOptional: true },
    { name: 'Italien', weeklyHours: 2, coefficient: 1, isOptional: true },
    { name: 'Espagnol', weeklyHours: 2, coefficient: 1, isOptional: true },
];


// --- HELPER FUNCTIONS ---

async function cleanupDatabase() {
    console.log('🧹 Nettoyage de la base de données...');

    // Delete in reverse order of dependency
    await prisma.chatroomMessage.deleteMany().catch(e => console.log('Pas de messages de chatroom à supprimer, on continue.'));
    await prisma.sessionParticipant.deleteMany().catch(e => console.log('Pas de participants de session à supprimer, on continue.'));
    await prisma.chatroomSession.deleteMany().catch(e => console.log('Pas de sessions de chatroom à supprimer, on continue.'));
    await prisma.result.deleteMany().catch(e => console.log('Pas de résultats à supprimer, on continue.'));
    await prisma.assignment.deleteMany().catch(e => console.log('Pas de devoirs à supprimer, on continue.'));
    await prisma.exam.deleteMany().catch(e => console.log('Pas d\'examens à supprimer, on continue.'));
    await prisma.attendance.deleteMany().catch(e => console.log('Pas de présences à supprimer, on continue.'));
    await prisma.lesson.deleteMany().catch(e => console.log('Pas de leçons à supprimer, on continue.'));
    await prisma.announcement.deleteMany().catch(e => console.log('Pas d\'annonces à supprimer, on continue.'));
    await prisma.event.deleteMany().catch(e => console.log('Pas d\'événements à supprimer, on continue.'));
    await prisma.optionalSubjectGroup.deleteMany().catch(e => console.log('Pas de groupes de matières optionnelles à supprimer, on continue.'));
    await prisma.student.deleteMany().catch(e => console.log('Pas d\'étudiants à supprimer, on continue.'));
    await prisma.parent.deleteMany().catch(e => console.log('Pas de parents à supprimer, on continue.'));
    await prisma.teacher.deleteMany().catch(e => console.log('Pas d\'enseignants à supprimer, on continue.'));
    await prisma.admin.deleteMany().catch(e => console.log('Pas d\'admins à supprimer, on continue.'));
    await prisma.class.deleteMany().catch(e => console.log('Pas de classes à supprimer, on continue.'));
    await prisma.grade.deleteMany().catch(e => console.log('Pas de niveaux à supprimer, on continue.'));
    await prisma.subject.deleteMany().catch(e => console.log('Pas de matières à supprimer, on continue.'));
    await prisma.classroom.deleteMany().catch(e => console.log('Pas de salles à supprimer, on continue.'));
    await prisma.user.deleteMany().catch(e => console.log('Pas d\'utilisateurs à supprimer, on continue.'));
    
    console.log('✅ Nettoyage terminé.');
}


async function main() {
  await cleanupDatabase();

  console.log('🌱 Début du peuplement de la base de données...');
  const hashedPassword = await bcrypt.hash('12345678', 10);

  // --- Create Admin ---
  console.log('👤 Création de l\'administrateur...');
  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      name: 'Admin Principal',
      role: 'ADMIN',
      active: true,
      firstName: 'Admin',
      lastName: 'Principal',
    }
  });
  await prisma.admin.create({ data: { userId: admin1.id, name: 'Admin', surname: 'Principal' } });
  console.log('✅ Administrateur créé.');

  // --- Create Parent ---
  console.log('👤 Création du parent...');
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@example.com',
      username: 'parent',
      password: hashedPassword,
      name: 'Parent Exemple',
      role: 'PARENT',
      active: true,
      firstName: 'Parent',
      lastName: 'Exemple',
    }
  });
  const parent = await prisma.parent.create({
    data: {
      userId: parentUser.id,
      name: 'Parent',
      surname: 'Exemple',
      phone: '123456789',
      address: '123 Rue Exemple'
    }
  });
  console.log('✅ Parent créé.');

  // --- Create Subjects ---
  console.log('📚 Création des matières...');
  const createdSubjects = await Promise.all(
    subjectsData.map(subject => prisma.subject.create({ data: subject }))
  );
  console.log(`✅ ${createdSubjects.length} matières créées.`);

  // --- Create Teachers (1 per subject) ---
  console.log('🧑‍🏫 Création des professeurs (1 par matière)...');
  const teachers = [];
  for (const subject of createdSubjects) {
      const teacherName = `Prof_${subject.name.replace(/\s+/g, '')}`;
      const teacherUser = await prisma.user.create({
          data: {
              email: `${teacherName.toLowerCase()}@example.com`,
              username: teacherName.toLowerCase(),
              password: hashedPassword,
              name: `${teacherName} Principal`,
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
  console.log(`✅ ${teachers.length} professeurs créés et assignés.`);
  
  // --- Create Grades, Classes, and Students ---
  const createdClasses = [];
  const createdGrades = [];
  const allStudents = [];

  for (let level = 1; level <= 4; level++) {
    console.log(`🏫 Création du niveau ${level}...`);
    const grade = await prisma.grade.upsert({
      where: { level },
      update: {},
      create: { level },
    });
    createdGrades.push(grade);

    const className = `${level}ème A`;
    const newClass = await prisma.class.create({
      data: {
        name: className,
        abbreviation: `${level}A`,
        capacity: 10,
        gradeId: grade.id,
      }
    });
    createdClasses.push(newClass);
    console.log(`  - Classe créée : ${className}`);

    // Create 10 students for this class
    for (let i = 1; i <= 10; i++) {
        const studentName = `Eleve_${level}A_${i}`;
        const studentUser = await prisma.user.create({
            data: {
                email: `${studentName.toLowerCase()}@example.com`,
                username: studentName.toLowerCase(),
                password: hashedPassword,
                name: `Élève ${i} ${level}A`,
                role: 'STUDENT',
                active: true,
                firstName: 'Élève',
                lastName: `${i} ${level}A`,
            }
        });
        const student = await prisma.student.create({
            data: {
                userId: studentUser.id,
                name: 'Élève',
                surname: `${i} ${level}A`,
                classId: newClass.id,
                gradeId: grade.id,
                parentId: parent.id // Assign all students to the single parent
            }
        });
        allStudents.push(student);
    }
     console.log(`✅ Niveau ${level} et sa classe de 10 élèves créés.`);
  }

  // --- Create classrooms ---
  console.log('🚪 Création des salles...');
  let totalRooms = 0;
  // 10 general classrooms
  for (let i = 1; i <= 10; i++) {
    await prisma.classroom.create({ data: { name: `Salle ${100 + i}`, capacity: 30 } });
    totalRooms++;
  }
  // 1 lab for each type
  await prisma.classroom.create({ data: { name: `Labo Physique`, capacity: 20 } }); totalRooms++;
  await prisma.classroom.create({ data: { name: `Labo Technique`, capacity: 20 } }); totalRooms++;
  await prisma.classroom.create({ data: { name: `Labo Sciences`, capacity: 20 } }); totalRooms++;
  await prisma.classroom.create({ data: { name: `Gymnase`, capacity: 40 } }); totalRooms++;
  
  console.log(`✅ ${totalRooms} salles et laboratoires créés.`);

  console.log('🎉 Peuplement de la base de données terminé avec succès ! (Données minimales)');
}

main()
  .catch((e) => {
    console.error('❌ Une erreur est survenue lors du seeding de la base de données :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
