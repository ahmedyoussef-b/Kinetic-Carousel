
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// --- DATA SETS ---

const arabicFirstNamesMale = [
  'Mohammed', 'Ahmed', 'Ali', 'Omar', 'Youssef', 'Khaled', 'Tariq', 'Hassan', 'Ibrahim', 'Karim',
  'Mustafa', 'Said', 'Jamal', 'Rashid', 'Sami', 'Nabil', 'Fahd', 'Walid', 'Zayd', 'Adil'
];
const arabicFirstNamesFemale = [
  'Fatma', 'Aisha', 'Zainab', 'Mariam', 'Nour', 'Layla', 'Salma', 'Hana', 'Yasmin', 'Amira',
  'Farah', 'Dina', 'Samira', 'Rania', 'Lina', 'Mona', 'Hind', 'Joud', 'Basma', 'Dalal'
];
const arabicLastNames = [
  'Haddad', 'Nasser', 'Malik', 'Khan', 'Jaber', 'Abboud', 'Darwish', 'Ghanem', 'Mansour', 'Koury',
  'Thabet', 'Zaki', 'Saleh', 'Farah', 'Bazzi', 'Chahine', 'Karam', 'Maalouf', 'Saba', 'Saliba'
];

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

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(gender) {
  const firstName = gender === 'male' ? getRandomElement(arabicFirstNamesMale) : getRandomElement(arabicFirstNamesFemale);
  const lastName = getRandomElement(arabicLastNames);
  return { firstName, lastName };
}

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
      email: 'amin@example.com',
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
      email: 'amin2@example.com',
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
  
  // --- Create Grades, Classes, Students, and Parents ---
  const createdClasses = [];
  const createdGrades = [];
  for (let level = 1; level <= 4; level++) {
    console.log(`🏫 Création du niveau ${level}...`);
    const grade = await prisma.grade.create({ data: { level } });
    createdGrades.push(grade);

    for (let classNum = 1; classNum <= 10; classNum++) {
      const className = `${level}ème Année - Section ${String.fromCharCode(64 + classNum)}`;
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

      for (let studentNum = 1; studentNum <= 30; studentNum++) {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        
        // Create Parent First
        const parentName = generateName(gender === 'male' ? 'female' : 'male');
        const parentUser = await prisma.user.create({
          data: {
            email: `parent_${level}_${classNum}_${studentNum}@example.com`,
            username: `parent_${level}_${classNum}_${studentNum}`,
            password: hashedPassword,
            name: `${parentName.firstName} ${parentName.lastName}`,
            role: 'PARENT',
            active: true,
            firstName: parentName.firstName,
            lastName: parentName.lastName,
          }
        });
        const parent = await prisma.parent.create({
          data: {
            userId: parentUser.id,
            name: parentName.firstName,
            surname: parentName.lastName,
          }
        });

        // Create Student
        const { firstName, lastName } = generateName(gender);
        const studentUser = await prisma.user.create({
          data: {
            email: `student_${level}_${classNum}_${studentNum}@example.com`,
            username: `student_${level}_${classNum}_${studentNum}`,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
            role: 'STUDENT',
            active: true,
            firstName: firstName,
            lastName: lastName,
          }
        });
        await prisma.student.create({
          data: {
            userId: studentUser.id,
            name: firstName,
            surname: lastName,
            sex: gender === 'male' ? 'MALE' : 'FEMALE',
            classId: newClass.id,
            gradeId: grade.id,
            parentId: parent.id,
            address: 'N/A', // Added a placeholder for address
            bloodType: 'Unknown', // Added a placeholder for bloodType
            birthday: new Date(), // Added a placeholder for the birthday field
          }
        });
      }
    }
     console.log(`✅ Niveau ${level} et ses 10 classes de 30 élèves créés.`);
  }
  
  // --- Create Optional Subjects & Assign them to students from 2nd year onwards ---
  console.log('📚 Création des matières optionnelles et assignation aux élèves...');
  const createdOptionalSubjects = await Promise.all(
      optionalSubjectsData.map(subject => prisma.subject.create({ data: subject }))
  );
  console.log(`✅ ${createdOptionalSubjects.length} matières optionnelles créées.`);
  
  const studentsFrom2ndYear = await prisma.student.findMany({
      where: {
          grade: {
              level: {
                  gte: 2
              }
          }
      }
  });

  for (const student of studentsFrom2ndYear) {
      const chosenSubject = getRandomElement(createdOptionalSubjects);
      await prisma.student.update({
          where: { id: student.id },
          data: {
              optionalSubjects: {
                  connect: { id: chosenSubject.id }
              }
          }
      });
  }
  console.log(`✅ Matières optionnelles assignées à ${studentsFrom2ndYear.length} élèves à partir de la 2ème année.`);


  // --- Create Teachers ---
  console.log('🧑‍🏫 Création des 90 professeurs...');
  const createdTeachers = [];
  const allSubjects = [...createdSubjects, ...createdOptionalSubjects];

  for (let i = 0; i < 90; i++) {
    const { firstName, lastName } = generateName('male');
    const user = await prisma.user.create({
      data: {
        email: `teacher${i + 1}@example.com`,
        username: `teacher${i + 1}`,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: 'TEACHER',
        active: true,
        firstName: firstName,
        lastName: lastName,
      }
    });
    
    // Assign a main subject to each teacher
    const subjectToTeach = allSubjects[i % allSubjects.length];
    
    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        name: firstName,
        surname: lastName,
        subjects: {
          connect: { id: subjectToTeach.id }
        }
      }
    });
    createdTeachers.push(teacher);
  }
  console.log(`✅ ${createdTeachers.length} professeurs créés.`);


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
