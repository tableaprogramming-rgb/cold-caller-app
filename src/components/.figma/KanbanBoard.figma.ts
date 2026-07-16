// url=https://www.figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking
// source=src/components/KanbanBoard.jsx
// component=KanbanBoard

import figma from 'figma'
const instance = figma.selectedInstance

const STAGES = ['New', 'To Call', 'Called', 'No Answer', 'For Demo', 'Done']

export default {
  example: figma.code`
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        ${STAGES.map((stage) => figma.code`
          <Droppable key="${stage}" droppableId="${stage}">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="column"
              >
                <div className="column-header">
                  <h3>${stage}</h3>
                  <span className="column-count">{contactCount}</span>
                </div>
                <div className="cards-list">
                  {contacts.map((contact, idx) => (
                    <Draggable key={contact.id} draggableId={contact.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <ContactCard contact={contact} onClick={() => onOpen(contact)} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        `).join('')}
      </div>
    </DragDropContext>
  `,
  imports: [
    'import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"',
    'import ContactCard from "./ContactCard"'
  ],
  id: 'kanban-board',
  metadata: {
    nestable: false,
  },
}
