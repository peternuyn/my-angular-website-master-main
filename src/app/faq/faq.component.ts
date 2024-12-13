import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';





@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
})

/**
 * The FaqComponent class is responsible for managing the FAQ section of the application.
 * It maintains the state of expanded FAQ items using the `expandedItems` array.
 * 
 * @property {number[]} expandedItems - An array that stores the indices of expanded FAQ items.
 * @property {Object[]} faqItems - An array of FAQ items, each containing a question and an answer.
 * 
 * @method toggleItem - Toggles the expansion state of a specific FAQ item by its index.
 */
export class FaqComponent {

  /* Array to store the indices of expanded FAQ items. The questions have been 
  clicked will be stored here. */
  expandedItems: number[] = [];  
  faqItems: { question: string; answer: string; }[] = []; // Populate this with your FAQ data
  /**
   * Toggles the expansion state of a specific FAQ item by its index.
   * 
   * @param {number} index - The index of the FAQ item to toggle.
   */
  toggleItem(index: number): void {
      const itemIndex = this.expandedItems.indexOf(index);
      if (itemIndex > -1) {
          this.expandedItems.splice(itemIndex, 1);
      } else {
          this.expandedItems.push(index);
      }
  }

  isLoading = true;


ngOnInit() {
    // Simulate a loading delay
    setTimeout(() => {
      this.faqItems = [
        {
          question: 'What is a Resume Portal?',
          answer: 'A Resume Portal is an online platform where you can create, manage, and share your resume with potential employers.'
        },
        {
          question: 'How do I create a resume?',
          answer: 'You can create a resume by filling out the required fields in the resume creation form and then saving your progress.'
        },
        {
          question: 'Can I edit my resume after creating it?',
          answer: 'Yes, you can edit your resume at any time by navigating to the "My Resumes" section and selecting the resume you wish to edit.'
        },
        {
          question: 'How do I share my resume with employers?',
          answer: 'You can share your resume by generating a shareable link or by directly sending it to employers through the portal.'
        }
      ];
      this.isLoading = false;
    }, 0); // Set the delay as needed
}
}


  
