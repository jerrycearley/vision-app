import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import * as bcrypt from 'bcrypt';

async function runSeeds() {
  console.log('Starting database seeding...');

  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  const queryRunner = dataSource.createQueryRunner();

  try {
    // Create test users
    console.log('Creating test users...');

    const passwordHash = await bcrypt.hash('password123', 10);

    // Adult user
    await queryRunner.query(`
      INSERT INTO users (id, email, "passwordHash", "displayName", "dateOfBirth", "isMinor", "emailVerified", "isActive")
      VALUES (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'adult@test.com',
        $1,
        'Test Adult',
        '1990-01-15',
        false,
        true,
        true
      )
      ON CONFLICT (email) DO NOTHING
    `, [passwordHash]);

    // Create profile for adult
    await queryRunner.query(`
      INSERT INTO user_profiles ("userId", bio, interests, skills, "educationLevel", "careerGoals", hobbies)
      VALUES (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'I am a test adult user interested in technology and education.',
        'programming,technology,education,startups',
        'javascript,python,project-management',
        'undergraduate',
        'become-a-software-engineer,build-a-startup',
        'gaming,reading,hiking'
      )
      ON CONFLICT ("userId") DO NOTHING
    `);

    // Minor user
    await queryRunner.query(`
      INSERT INTO users (id, email, "passwordHash", "displayName", "dateOfBirth", "isMinor", "emailVerified", "isActive")
      VALUES (
        'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        'minor@test.com',
        $1,
        'Test Minor',
        '2010-06-20',
        true,
        true,
        true
      )
      ON CONFLICT (email) DO NOTHING
    `, [passwordHash]);

    // Create profile for minor
    await queryRunner.query(`
      INSERT INTO user_profiles ("userId", bio, interests, skills, "educationLevel", "careerGoals", hobbies)
      VALUES (
        'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        'I am a test minor user interested in learning.',
        'gaming,art,music,coding',
        'drawing,minecraft',
        'middle_school',
        'become-a-game-developer',
        'gaming,drawing,youtube'
      )
      ON CONFLICT ("userId") DO NOTHING
    `);

    // Guardian user
    await queryRunner.query(`
      INSERT INTO users (id, email, "passwordHash", "displayName", "dateOfBirth", "isMinor", "emailVerified", "isActive")
      VALUES (
        'c3d4e5f6-a7b8-9012-cdef-123456789012',
        'guardian@test.com',
        $1,
        'Test Guardian',
        '1985-03-10',
        false,
        true,
        true
      )
      ON CONFLICT (email) DO NOTHING
    `, [passwordHash]);

    // Create guardianship link
    await queryRunner.query(`
      INSERT INTO guardianship_links (id, "guardianId", "minorId", relationship, status, "consentGivenAt")
      VALUES (
        'd4e5f6a7-b8c9-0123-defa-234567890123',
        'c3d4e5f6-a7b8-9012-cdef-123456789012',
        'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        'parent',
        'active',
        NOW()
      )
      ON CONFLICT DO NOTHING
    `);

    // Create token settings
    console.log('Creating token settings...');
    await queryRunner.query(`
      INSERT INTO token_settings (id, "tokenName", "tokenSymbol", decimals, "minorLockEnabled", "defaultLockDurationDays", "onChainEnabled")
      VALUES (
        'e5f6a7b8-c9d0-1234-efab-345678901234',
        'Vision Token',
        'VSN',
        18,
        true,
        365,
        false
      )
      ON CONFLICT DO NOTHING
    `);

    // Create sample goals
    console.log('Creating sample goals...');
    await queryRunner.query(`
      INSERT INTO goals (id, "userId", title, description, category, status, priority, tags)
      VALUES
        ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Learn Full-Stack Development', 'Master modern web development with React and Node.js', 'skill', 'active', 10, 'coding,career,web-development'),
        ('a7b8c9d0-e1f2-3456-abcd-567890123456', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Launch a Side Project', 'Build and launch a SaaS product', 'career', 'draft', 8, 'entrepreneurship,coding,startup'),
        ('b8c9d0e1-f2a3-4567-bcde-678901234567', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Learn Game Development', 'Create my first video game', 'skill', 'active', 10, 'gaming,coding,creativity')
      ON CONFLICT DO NOTHING
    `);

    // Seed careers data
    console.log('Seeding career data...');
    const careers = [
      { title: 'Software Developer', category: 'technology', description: 'Build applications and systems' },
      { title: 'Data Scientist', category: 'technology', description: 'Analyze data and build ML models' },
      { title: 'UX Designer', category: 'design', description: 'Design user experiences for products' },
      { title: 'Product Manager', category: 'business', description: 'Lead product development teams' },
      { title: 'Doctor', category: 'healthcare', description: 'Provide medical care to patients' },
      { title: 'Teacher', category: 'education', description: 'Educate and inspire students' },
      { title: 'Environmental Scientist', category: 'science', description: 'Study and protect the environment' },
      { title: 'Digital Marketer', category: 'marketing', description: 'Promote products online' },
    ];

    // Seed hobbies data
    console.log('Seeding hobbies data...');
    const hobbies = [
      'Programming', 'Video Games', 'Reading', 'Drawing', 'Photography',
      'Music', 'Sports', 'Cooking', 'Gardening', 'Hiking',
      'Writing', 'Chess', 'Robotics', '3D Printing', 'Volunteering'
    ];

    // Seed sample schools
    console.log('Seeding sample schools...');
    const schools = [
      { name: 'MIT', type: 'university', location: 'Cambridge, MA' },
      { name: 'Stanford University', type: 'university', location: 'Stanford, CA' },
      { name: 'Coding Bootcamp XYZ', type: 'bootcamp', location: 'Online' },
      { name: 'Community College', type: 'college', location: 'Various' },
    ];

    // Create sample roadmap
    console.log('Creating sample roadmap...');
    await queryRunner.query(`
      INSERT INTO roadmaps (id, "userId", "goalId", title, description, "estimatedDuration", "aiGenerated", status)
      VALUES (
        'c9d0e1f2-a3b4-5678-cdef-789012345678',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'f6a7b8c9-d0e1-2345-fabc-456789012345',
        'Full-Stack Developer Roadmap',
        'A comprehensive path to becoming a full-stack developer',
        '6 months',
        true,
        'active'
      )
      ON CONFLICT DO NOTHING
    `);

    // Create sample milestones
    await queryRunner.query(`
      INSERT INTO milestones (id, "roadmapId", title, description, "order", status, "tokenReward", "verificationRequired")
      VALUES
        ('d0e1f2a3-b4c5-6789-defa-890123456789', 'c9d0e1f2-a3b4-5678-cdef-789012345678', 'Learn HTML & CSS', 'Master the basics of web development', 0, 'completed', 10, true),
        ('e1f2a3b4-c5d6-7890-efab-901234567890', 'c9d0e1f2-a3b4-5678-cdef-789012345678', 'Learn JavaScript', 'Become proficient in JavaScript', 1, 'in_progress', 20, true),
        ('f2a3b4c5-d6e7-8901-fabc-012345678901', 'c9d0e1f2-a3b4-5678-cdef-789012345678', 'Learn React', 'Build modern UIs with React', 2, 'pending', 25, true),
        ('a3b4c5d6-e7f8-9012-abcd-123456789012', 'c9d0e1f2-a3b4-5678-cdef-789012345678', 'Learn Node.js', 'Backend development with Node.js', 3, 'pending', 25, true),
        ('b4c5d6e7-f8a9-0123-bcde-234567890123', 'c9d0e1f2-a3b4-5678-cdef-789012345678', 'Build a Full-Stack Project', 'Put it all together', 4, 'pending', 50, true)
      ON CONFLICT DO NOTHING
    `);

    // Create token balances for test users
    console.log('Creating token balances...');
    await queryRunner.query(`
      INSERT INTO token_balances (id, "userId", "availableBalance", "lockedBalance", "pendingBalance")
      VALUES
        ('c5d6e7f8-a9b0-1234-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 100, 0, 0),
        ('d6e7f8a9-b0c1-2345-defa-456789012345', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 0, 50, 0)
      ON CONFLICT ("userId") DO NOTHING
    `);

    // Create lock status for minor
    await queryRunner.query(`
      INSERT INTO token_lock_status (id, "userId", "isLocked", "lockedAmount", "lockReason", "lockStartDate", "unlockDate")
      VALUES (
        'e7f8a9b0-c1d2-3456-efab-567890123456',
        'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        true,
        50,
        'minor_protection',
        NOW(),
        NOW() + INTERVAL '365 days'
      )
      ON CONFLICT DO NOTHING
    `);

    console.log('Database seeding completed successfully!');
    console.log('\nTest Accounts:');
    console.log('- Adult: adult@test.com / password123');
    console.log('- Minor: minor@test.com / password123');
    console.log('- Guardian: guardian@test.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

runSeeds().catch(console.error);
