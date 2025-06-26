'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update book images with better, more diverse covers
    const bookImageUpdates = [
      // Fiction Classics - Literary themed images
      { id: 1, image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop' }, // To Kill a Mockingbird - Old book
      { id: 2, image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop' }, // 1984 - Dark, dystopian
      { id: 3, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop' }, // The Great Gatsby - Elegant
      { id: 4, image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop' }, // Pride and Prejudice - Classic
      
      // Science Fiction - Futuristic and space themed
      { id: 5, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop' }, // Dune - Desert planet
      { id: 6, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop' }, // Hitchhiker's Guide - Space
      { id: 7, image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=600&fit=crop' }, // Neuromancer - Cyberpunk
      
      // Mystery & Thriller - Dark and mysterious
      { id: 8, image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop' }, // Girl with Dragon Tattoo - Dark
      { id: 9, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop' }, // Gone Girl - Mystery
      { id: 10, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop' }, // The Silent Patient - Psychological
      
      // Fantasy - Magical and epic
      { id: 11, image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop' }, // The Hobbit - Adventure
      { id: 12, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop' }, // Game of Thrones - Epic
      { id: 13, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop' }, // Name of the Wind - Magic
      
      // Non-Fiction - Knowledge and wisdom
      { id: 14, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop' }, // Sapiens - Human evolution
      { id: 15, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop' }, // Atomic Habits - Self-improvement
      { id: 16, image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop' }, // Power of Now - Mindfulness
      
      // Business & Technology - Modern and professional
      { id: 17, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop' }, // Lean Startup - Business
      { id: 18, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop' }, // Clean Code - Programming
      { id: 19, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop' }, // Design Patterns - Software
      
      // Contemporary Fiction - Modern life
      { id: 20, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop' }, // The Alchemist - Journey
      { id: 21, image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop' }, // The Kite Runner - Friendship
      { id: 22, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop' }, // Life of Pi - Adventure
      
      // Young Adult - Coming of age
      { id: 23, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop' }, // Hunger Games - Survival
      { id: 24, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop' }, // Fault in Our Stars - Love
      { id: 25, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop' }  // Divergent - Choice
    ];

    // Update each book with its new image
    for (const update of bookImageUpdates) {
      await queryInterface.bulkUpdate('books', 
        { image: update.image, updatedAt: new Date() },
        { id: update.id }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert to original images (empty or placeholder)
    await queryInterface.bulkUpdate('books', 
      { image: null, updatedAt: new Date() },
      { id: { [Sequelize.Op.between]: [1, 25] } }
    );
  }
};
