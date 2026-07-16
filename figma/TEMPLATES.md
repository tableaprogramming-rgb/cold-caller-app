# Code Connect Template Files

This file documents the 6 Code Connect template files that map Figma components to React code.

## Template Files

### 1. LoginPage.figma.ts

Maps the Figma login form to React LoginPage component.

```typescript
// url=https://www.figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking
// source=src/pages/LoginPage.jsx
// component=LoginPage
import figma from 'figma'
const instance = figma.selectedInstance

const welcomeText = instance.findText('Welcome Title')?.textContent || 'Welcome back'
const usernamePlaceholder = instance.findText('Username Placeholder')?.textContent || 'Your username'
const passwordPlaceholder = instance.findText('Password Placeholder')?.textContent || '••••••••'

export default {
  example: figma.code`
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>${welcomeText}</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="login-username">Username</label>
            <input id="login-username" type="text" placeholder="${usernamePlaceholder}" />
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input id="login-password" type="password" placeholder="${passwordPlaceholder}" />
          </div>
          <button type="submit" className="auth-btn">Sign in</button>
        </form>
      </div>
    </div>
  `,
  imports: ['import { useState } from "react"'],
  id: 'login-page',
  metadata: { nestable: false, category: 'page' }
}
```

### 2. ContactCard.figma.ts

Maps the Figma contact card to React ContactCard component.

```typescript
// url=https://www.figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking
// source=src/components/ContactCard.jsx
// component=ContactCard
import figma from 'figma'
const instance = figma.selectedInstance

const companyName = instance.findText('Company Name')?.textContent || 'Company Name'
const contactPerson = instance.findText('Contact Person')?.textContent || 'Contact'
const phone = instance.findText('Phone')?.textContent || 'Phone'

export default {
  example: figma.code`
    <div className="contact-card">
      <div className="card-header">
        <h3 className="company-name">${companyName}</h3>
      </div>
      <div className="card-body">
        <div className="info-row">
          <span className="label">Contact:</span>
          <span className="value">${contactPerson}</span>
        </div>
        <div className="info-row">
          <span className="label">Phone:</span>
          <a href={`tel:\${contact.contact_number}`}>${phone}</a>
        </div>
      </div>
    </div>
  `,
  id: 'contact-card',
  metadata: { nestable: true, category: 'card' }
}
```

### 3. DetailModal.figma.ts

Maps the Figma detail modal to React DetailModal component.

```typescript
// url=https://www.figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking
// source=src/components/DetailModal.jsx
// component=DetailModal
import figma from 'figma'
const instance = figma.selectedInstance

const companyName = instance.findText('Company Name')?.textContent || 'Company'
const statusOptions = ['New', 'To Call', 'Called', 'No Answer', 'For Demo', 'Done']

export default {
  example: figma.code`
    <div className="dm-overlay" onClick={onClose}>
      <div className="dm-modal" role="dialog">
        <div className="dm-header">
          <h2>${companyName}</h2>
          <button className="dm-close" onClick={onClose}>×</button>
        </div>
        <div className="dm-body">
          <div className="dm-field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              ${statusOptions.map(s => figma.code`<option value="${s}">${s}</option>`)}
            </select>
          </div>
          <div className="dm-field">
            <label>Comments</label>
            <textarea value={comments} onChange={(e) => setComments(e.target.value)} />
          </div>
        </div>
        <div className="dm-actions">
          <button className="dm-cancel" onClick={onClose}>Cancel</button>
          <button className="dm-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  `,
  id: 'detail-modal',
  metadata: { nestable: false, category: 'modal' }
}
```

### 4. KanbanBoard.figma.ts

Maps the Figma kanban board to React KanbanBoard component.

```typescript
// url=https://www.figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking
// source=src/components/KanbanBoard.jsx
// component=KanbanBoard
import figma from 'figma'
const instance = figma.selectedInstance

const stages = ['New', 'To Call', 'Called', 'No Answer', 'For Demo', 'Done']

export default {
  example: figma.code`
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        ${stages.map((stage) => figma.code`
          <Droppable key="${stage}" droppableId="${stage}">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="droppable-zone"
              >
                <Column stage="${stage}" contacts={contacts} />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        `).join('')}
      </div>
    </DragDropContext>
  `,
  imports: ['import { DragDropContext, Droppable } from "@hello-pangea/dnd"'],
  id: 'kanban-board',
  metadata: { nestable: false, category: 'layout' }
}
```

### 5. TableView.figma.ts

Maps the Figma table to React TableView component.

```typescript
// url=https://www.figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking
// source=src/components/TableView.jsx
// component=TableView
import figma from 'figma'
const instance = figma.selectedInstance

const columns = ['Company', 'Contact', 'Phone', 'Status', 'Access', 'Role', 'Actions']

export default {
  example: figma.code`
    <div className="table-view-wrapper">
      <table className="table-view">
        <thead>
          <tr>
            ${columns.map(col => figma.code`<th>${col}</th>`)}
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.company}</td>
              <td>{contact.contact_person}</td>
              <td><a href={`tel:\${contact.contact_number}`}>{contact.contact_number}</a></td>
              <td>
                <select value={contact.status} onChange={(e) => onStatusChange(contact.id, e.target.value)}>
                  <option value="New">New</option>
                  <option value="To Call">To Call</option>
                  <option value="Called">Called</option>
                  <option value="No Answer">No Answer</option>
                  <option value="For Demo">For Demo</option>
                  <option value="Done">Done</option>
                </select>
              </td>
              <td><span className="table-badge">{access.label}</span></td>
              <td>{access.role}</td>
              <td><button onClick={() => onOpen(contact)}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  `,
  id: 'table-view',
  metadata: { nestable: false, category: 'view' }
}
```

### 6. SearchBar.figma.ts

Maps the Figma search bar to React SearchBar component.

```typescript
// url=https://www.figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking
// source=src/components/SearchBar.jsx
// component=SearchBar
import figma from 'figma'
const instance = figma.selectedInstance

const placeholder = instance.findText('Placeholder')?.textContent ||
  'Search by company, contact name, or phone...'

export default {
  example: figma.code`
    <div className="search-bar">
      <input
        type="text"
        placeholder="${placeholder}"
        value={query}
        onChange={handleChange}
        className="search-input"
      />
      {query && (
        <button onClick={handleClear} className="clear-btn">
          Clear
        </button>
      )}
    </div>
  `,
  imports: ['import { useState } from "react"'],
  id: 'search-bar',
  metadata: { nestable: true, category: 'input' }
}
```

## Creating Templates

To create new templates:

1. Open Figma component
2. Create `.ComponentName.figma.ts` file
3. Use pattern above with:
   - `import figma from 'figma'`
   - `const instance = figma.selectedInstance`
   - Extract properties using `instance.findText()`, `instance.getEnum()`, etc.
   - Export default with `example`, `id`, `imports`, `metadata`

## Testing Templates

1. Open Figma Code Connect preview
2. Verify code snippet generates correctly
3. Check all props are extracted
4. Validate imports
5. Test prop mappings

See README.md for full documentation.
