import { Draggable } from '@hello-pangea/dnd';
import ContactCard from './ContactCard';
import './Column.css';

export default function Column({ stage, contacts, onCardUpdate }) {
  return (
    <div className="column">
      <div className="column-header">
        <h2>{stage}</h2>
        <span className="column-count">{contacts.length}</span>
      </div>
      <div className="column-cards">
        {contacts.map((contact, index) => (
          <Draggable key={contact.id} draggableId={contact.id} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`draggable-card ${snapshot.isDragging ? 'dragging' : ''}`}
              >
                <ContactCard contact={contact} onUpdate={onCardUpdate} />
              </div>
            )}
          </Draggable>
        ))}
      </div>
    </div>
  );
}
