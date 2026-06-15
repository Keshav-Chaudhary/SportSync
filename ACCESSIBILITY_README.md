# Accessibility & UX Guidelines

To ensure the Gym & Sports System is usable by everyone, several accessibility (a11y) and User Experience best practices have been implemented throughout the UI.

## 1. Visual Accessibility
- **Contrast & Color Semantics**: Use of standardized Shadcn/Tailwind color palettes ensuring high contrast between text and backgrounds.
- **Semantic Badging**: Statuses are color-coded intuitively (`Destructive/Red` for Overdue, `Secondary/Gray` for Returned, `Emerald/Green` for Active) but are accompanied by clear textual labels to not rely on color alone.
- **Typography**: Clear, legible fonts with structured header hierarchies (`h1` through `h4`) within application cards.

## 2. Component Usability
- **Mobile-First Design**: Complex data tables (like Loan Management and User Management) dynamically collapse into stacked, sleek, and animated cards on mobile viewports. This prevents horizontal scrolling and provides a native-app feel.
- **Focus Management**: Interactive elements (buttons, inputs, dropdowns) have distinct focus states provided by Shadcn UI.
- **Feedback & Load States**: 
  - Every async action (e.g., checking in, returning a loan, deleting a user) disables the trigger button and displays a spinning `Loader2` icon.
  - Clear success or error boundary alerts prevent users from guessing if an action succeeded.

## 3. Navigation
- **Clear Routing**: The sidebar navigation clearly indicates the active page.
- **Tabbed Interfaces**: Complex pages use intuitive tab systems (e.g., switching between "Active & Overdue" and "Loan History") to prevent cognitive overload.

## 4. Dialogs & Modals
- **Destructive Actions**: Irreversible actions, such as user or record deletion, require an explicit confirmation modal outlining the consequences before execution.
- **Responsive Modals**: Modals scale gracefully and become scrollable on small devices, ensuring buttons are always reachable.
