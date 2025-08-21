
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

  // --- Create Admins ---
  console.log('👤 Création des administrateurs...');
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

  const admin2 = await prisma.user.create({
    data: {
      email: 'admin2@example.com',
      username: 'admin2',
      password: hashedPassword,
      name: 'Admin Secondaire',
      role: 'ADMIN',
      active: true,
      firstName: 'Admin',
      lastName: 'Secondaire',
    }
  });
  await prisma.admin.create({ data: { userId: admin2.id, name: 'Admin', surname: 'Secondaire' } });
  console.log('✅ Administrateurs créés.');

  // --- Create Subjects ---
  console.log('📚 Création des matières...');
  const createdSubjects = await Promise.all(
    subjectsData.map(subject => prisma.subject.create({ data: subject }))
  );
  console.log(`✅ ${createdSubjects.length} matières créées.`);

  const createdOptionalSubjects = await Promise.all(
      optionalSubjectsData.map(subject => prisma.subject.create({ data: subject }))
  );
  console.log(`✅ ${createdOptionalSubjects.length} matières optionnelles créées.`);
  
  // --- Create Grades and Classes (without students) ---
  const createdClasses = [];
  const createdGrades = [];
  for (let level = 1; level <= 4; level++) {
    console.log(`🏫 Création du niveau ${level}...`);
    const grade = await prisma.grade.upsert({
      where: { level },
      update: {},
      create: { level },
    });
    createdGrades.push(grade);

    for (let classNum = 1; classNum <= 2; classNum++) { 
      const className = `${level}ème ${String.fromCharCode(64 + classNum)}`;
      const newClass = await prisma.class.create({
        data: {
          name: className,
          abbreviation: `${level}${String.fromCharCode(64 + classNum)}`,
          capacity: 30,
          gradeId: grade.id,
        }
      });
      createdClasses.push(newClass);
      console.log(`  - Classe créée : ${className}`);
    }
     console.log(`✅ Niveau ${level} et ses classes créés.`);
  }

  // --- Create classrooms ---
  console.log('🚪 Création des salles...');
  let totalRooms = 0;
  // 25 general classrooms
  for (let i = 1; i <= 25; i++) {
    await prisma.classroom.create({ data: { name: `Salle ${100 + i}`, capacity: 30 } });
    totalRooms++;
  }
  // 2 physics labs
  for (let i = 1; i <= 2; i++) {
    await prisma.classroom.create({ data: { name: `Labo Physique ${i}`, capacity: 20 } });
    totalRooms++;
  }
  // 2 tech labs
  for (let i = 1; i <= 2; i++) {
    await prisma.classroom.create({ data: { name: `Labo Technique ${i}`, capacity: 20 } });
    totalRooms++;
  }
  // 2 science labs
  for (let i = 1; i <= 2; i++) {
    await prisma.classroom.create({ data: { name: `Labo Sciences ${i}`, capacity: 20 } });
    totalRooms++;
  }
  // 2 gyms
  for (let i = 1; i <= 2; i++) {
    await prisma.classroom.create({ data: { name: `Gymnase ${i}`, capacity: 40 } });
    totalRooms++;
  }
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

    
