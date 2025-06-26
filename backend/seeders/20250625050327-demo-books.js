'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('books', [
      // Fiction Classics
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        genre: 'Fiction',
        description: 'A powerful story of racial injustice and the loss of innocence in the American South.',
        image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '1984',
        author: 'George Orwell',
        genre: 'Fiction',
        description: 'A dystopian novel about totalitarianism and surveillance society.',
        image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genre: 'Fiction',
        description: 'A story of decadence and excess, exploring the darker aspects of the Jazz Age.',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        genre: 'Romance',
        description: 'A classic romance novel about the relationship between Elizabeth Bennet and Mr. Darcy.',
        image: 'https://images.unsplash.com/photo-1463320898484-cdee8141c787?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Science Fiction
      {
        title: 'Dune',
        author: 'Frank Herbert',
        genre: 'Science Fiction',
        description: 'An epic science fiction novel about politics, religion, and survival on a desert planet.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'The Hitchhiker\'s Guide to the Galaxy',
        author: 'Douglas Adams',
        genre: 'Science Fiction',
        description: 'A humorous science fiction series about the adventures of Arthur Dent in space.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Neuromancer',
        author: 'William Gibson',
        genre: 'Science Fiction',
        description: 'A groundbreaking cyberpunk novel that defined the genre.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Mystery & Thriller
      {
        title: 'The Girl with the Dragon Tattoo',
        author: 'Stieg Larsson',
        genre: 'Mystery',
        description: 'A gripping mystery novel about a journalist and a computer hacker investigating a 40-year-old disappearance.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Gone Girl',
        author: 'Gillian Flynn',
        genre: 'Thriller',
        description: 'A psychological thriller about a woman who disappears on her fifth wedding anniversary.',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'The Silent Patient',
        author: 'Alex Michaelides',
        genre: 'Thriller',
        description: 'A psychological thriller about a woman who shoots her husband and then never speaks again.',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Fantasy
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        genre: 'Fantasy',
        description: 'A fantasy novel about Bilbo Baggins, a hobbit who embarks on an adventure with thirteen dwarves.',
        image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'A Game of Thrones',
        author: 'George R.R. Martin',
        genre: 'Fantasy',
        description: 'The first book in the epic fantasy series A Song of Ice and Fire.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'The Name of the Wind',
        author: 'Patrick Rothfuss',
        genre: 'Fantasy',
        description: 'A fantasy novel about Kvothe, a legendary musician and magician.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Non-Fiction
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        genre: 'History',
        description: 'A groundbreaking narrative of humanity\'s creation and evolution.',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        genre: 'Self-Help',
        description: 'A guide to building good habits and breaking bad ones.',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'The Power of Now',
        author: 'Eckhart Tolle',
        genre: 'Self-Help',
        description: 'A guide to spiritual enlightenment and living in the present moment.',
        image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Business & Technology
      {
        title: 'The Lean Startup',
        author: 'Eric Ries',
        genre: 'Business',
        description: 'A methodology for developing businesses and products that aims to shorten product development cycles.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        genre: 'Technology',
        description: 'A handbook of agile software craftsmanship.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Design Patterns',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        genre: 'Technology',
        description: 'Elements of Reusable Object-Oriented Software.',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Contemporary Fiction
      {
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        genre: 'Fiction',
        description: 'A novel about a young Andalusian shepherd who dreams of finding a worldly treasure.',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'The Kite Runner',
        author: 'Khaled Hosseini',
        genre: 'Fiction',
        description: 'A story of unlikely friendship between a wealthy boy and the son of his father\'s servant.',
        image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Life of Pi',
        author: 'Yann Martel',
        genre: 'Fiction',
        description: 'A novel about an Indian boy who survives a shipwreck and is stranded in the Pacific Ocean.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Young Adult
      {
        title: 'The Hunger Games',
        author: 'Suzanne Collins',
        genre: 'Young Adult',
        description: 'A dystopian novel about a televised battle to the death between teenagers.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'The Fault in Our Stars',
        author: 'John Green',
        genre: 'Young Adult',
        description: 'A novel about two teenagers who meet at a cancer support group and fall in love.',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Divergent',
        author: 'Veronica Roth',
        genre: 'Young Adult',
        description: 'A dystopian novel about a society divided into factions based on virtues.',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('books', null, {});
  }
};
