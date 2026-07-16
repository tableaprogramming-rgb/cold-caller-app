/**
 * Figma Code Connect Configuration
 * Cold Calling Tracker - React + Vite Application
 *
 * This file maps Figma design system components to React components
 * Used by the Code Connect plugin to link design to implementation
 *
 * Design file: https://www.figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking
 * Design Systems: Kando (28 components) + Element Plus (17 components)
 */

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

const componentRegistry = {
  // ========== PAGE COMPONENTS ==========

  /**
   * LoginPage - Authentication entry point
   * Maps to Figma: kan_input + kan_button
   */
  LoginPage: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'Login Form',
    reactPath: 'src/pages/LoginPage.jsx',
    reactComponentName: 'LoginPage',
    description: 'Authentication login page with username/password form',
    figmaComponentsUsed: ['kan_input', 'kan_button', 'kan_link'],
    status: 'production',
    lastUpdated: '2026-07-15',
  },

  /**
   * RegisterPage - User account creation
   * Maps to Figma: kan_input + kan_button + Modal
   */
  RegisterPage: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'Register Form',
    reactPath: 'src/pages/RegisterPage.jsx',
    reactComponentName: 'RegisterPage',
    description: 'User registration form with account creation',
    figmaComponentsUsed: ['kan_input', 'kan_button', 'kan_link', 'Pop-Up'],
    status: 'production',
    lastUpdated: '2026-07-15',
  },

  /**
   * AccountSettingsPage - User access and permissions management
   * Maps to Figma: kan_input + kan_button + Select + Table
   */
  AccountSettingsPage: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'Account Settings',
    reactPath: 'src/pages/AccountSettingsPage.jsx',
    reactComponentName: 'AccountSettingsPage',
    description: 'Account settings with user invitation and access management',
    figmaComponentsUsed: ['kan_input', 'kan_field', 'Select', 'kan_button', 'Table Cell'],
    status: 'production',
    lastUpdated: '2026-07-15',
  },

  // ========== LAYOUT & STRUCTURE COMPONENTS ==========

  /**
   * KanbanBoard - 6-stage contact pipeline view
   * Maps to Figma: kan_tab + Card + Column structure
   */
  KanbanBoard: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'Kanban Board',
    reactPath: 'src/components/KanbanBoard.jsx',
    reactComponentName: 'KanbanBoard',
    description: 'Main kanban view with 6 stages (New → Done)',
    figmaComponentsUsed: ['kan_tab', 'Card', 'Column', 'DragHandle'],
    nestedComponents: ['Column', 'ContactCard'],
    status: 'production',
    lastUpdated: '2026-07-15',
  },

  /**
   * Column - Individual kanban stage column
   * Maps to Figma: kan_tab (header) + Card (contact cards)
   */
  Column: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'Column',
    reactPath: 'src/components/Column.jsx',
    reactComponentName: 'Column',
    description: 'Single kanban column container with header and draggable cards',
    figmaComponentsUsed: ['kan_tab', 'kan_badge', 'Card'],
    status: 'production',
    lastUpdated: '2026-07-15',
  },

  // ========== CARD & MODAL COMPONENTS ==========

  /**
   * ContactCard - Individual contact display in kanban board
   * Maps to Figma: Card + kan_badge + kan_button + Input (comments)
   */
  ContactCard: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'Contact Card',
    reactPath: 'src/components/ContactCard.jsx',
    reactComponentName: 'ContactCard',
    description: 'Individual contact card with editable comments',
    figmaComponentsUsed: ['Card', 'kan_badge', 'kan_text', 'kan_link', 'kan_text-area', 'kan_button'],
    status: 'production',
    lastUpdated: '2026-07-15',
  },

  /**
   * DetailModal - Full contact details modal
   * Maps to Figma: Pop-Up + kan_text-area + Select + kan_button
   */
  DetailModal: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'Contact Details Modal',
    reactPath: 'src/components/DetailModal.jsx',
    reactComponentName: 'DetailModal',
    description: 'Full-detail modal with editable status and comments',
    figmaComponentsUsed: ['Pop-Up', 'kan_text', 'Select', 'kan_text-area', 'kan_button'],
    status: 'production',
    lastUpdated: '2026-07-15',
  },

  /**
   * FirstLoginModal - Forced password change modal
   * Maps to Figma: Pop-Up + kan_input + kan_button
   */
  FirstLoginModal: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'First Login Modal',
    reactPath: 'src/components/FirstLoginModal.jsx',
    reactComponentName: 'FirstLoginModal',
    description: 'Forced password change modal for first-time invited users',
    figmaComponentsUsed: ['Pop-Up', 'kan_input', 'kan_button', 'kan_text'],
    status: 'production',
    lastUpdated: '2026-07-15',
  },

  /**
   * TableView - Tabular view of all contacts
   * Maps to Figma: Table Cell + Select + kan_button
   */
  TableView: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'Contact Table',
    reactPath: 'src/components/TableView.jsx',
    reactComponentName: 'TableView',
    description: 'Table view of contacts with inline status editing',
    figmaComponentsUsed: ['Table Cell', 'Select', 'kan_button', 'kan_badge'],
    status: 'production',
    lastUpdated: '2026-07-15',
  },

  // ========== FORM INPUT COMPONENTS ==========

  /**
   * SearchBar - Contact search and filter input
   * Maps to Figma: kan_field + kan_input + kan_button
   */
  SearchBar: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'Search Bar',
    reactPath: 'src/components/SearchBar.jsx',
    reactComponentName: 'SearchBar',
    description: 'Search/filter input with clear button',
    figmaComponentsUsed: ['kan_field', 'kan_input', 'kan_button'],
    status: 'production',
    lastUpdated: '2026-07-15',
  },

  // ========== PRIMITIVE COMPONENTS ==========

  Button: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'kan_button',
    description: 'Button component with variants',
    figmaComponentsUsed: ['kan_button'],
    variants: ['primary', 'secondary', 'ghost', 'icon', 'danger'],
    status: 'production',
  },

  Input: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'kan_input',
    description: 'Text input component',
    figmaComponentsUsed: ['kan_input'],
    types: ['text', 'password', 'email', 'search'],
    status: 'production',
  },

  Select: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'Select',
    description: 'Dropdown select component',
    figmaComponentsUsed: ['Select'],
    status: 'production',
  },

  Textarea: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'kan_text-area',
    description: 'Multi-line text area component',
    figmaComponentsUsed: ['kan_text-area'],
    status: 'production',
  },

  Badge: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'kan_badge',
    description: 'Badge component for roles and statuses',
    figmaComponentsUsed: ['kan_badge'],
    variants: ['owner', 'editor', 'viewer', 'success', 'warning', 'error'],
    status: 'production',
  },

  Card: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'Card',
    description: 'Card container component',
    figmaComponentsUsed: ['Card'],
    status: 'production',
  },

  Modal: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'Pop-Up',
    description: 'Modal dialog component with overlay',
    figmaComponentsUsed: ['Pop-Up'],
    status: 'production',
  },

  Text: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'kan_text',
    description: 'Text component with size and weight variants',
    figmaComponentsUsed: ['kan_text'],
    sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
    weights: ['regular', 'medium', 'semibold', 'bold'],
    status: 'production',
  },

  Link: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'kan_link',
    description: 'Link component for navigation and external links',
    figmaComponentsUsed: ['kan_link'],
    types: ['nav', 'email', 'phone'],
    status: 'production',
  },

  Tab: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'kan_tab',
    description: 'Tab component for navigation and grouping',
    figmaComponentsUsed: ['kan_tab'],
    status: 'production',
  },

  Field: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'kan_field',
    description: 'Form field wrapper with label',
    figmaComponentsUsed: ['kan_field'],
    status: 'production',
  },

  TableCell: {
    figmaFile: 'PhfWVOOFvwPbtpHBUNa47V',
    figmaComponentName: 'Table Cell',
    description: 'Table cell component for row/column content',
    figmaComponentsUsed: ['Table Cell'],
    status: 'production',
  },
};

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

module.exports = {
  project: 'Cold Calling Tracker',
  description: 'React + Vite SPA for managing sales contacts through 6-stage kanban pipeline',
  figmaFile: 'https://www.figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking',
  designSystems: ['Kando (28 components)', 'Element Plus (17 components)'],
  framework: 'React 18',
  language: 'JavaScript/JSX',
  buildTool: 'Vite',
  components: componentRegistry,
  stats: {
    totalComponents: Object.keys(componentRegistry).length,
    pageComponents: 3,
    layoutComponents: 2,
    cardModalComponents: 4,
    formInputComponents: 1,
    primitiveComponents: 10,
    figmaComponentsUsed: 17,
  },
  status: 'complete',
  version: '1.0.0',
  lastUpdated: '2026-07-15',
  maintainer: 'Design System Team',
};
