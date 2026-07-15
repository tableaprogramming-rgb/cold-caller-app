import { Draggable } from '@hello-pangea/dnd';
import ContactCard from './ContactCard';
import './Column.css';

export default function Column({ stage, contacts, onCardUpdate, getAccess, onOpen }) {
  return (
    <div className="column">
      <div className="column-header">
        <h2>{stage}</h2>
        <span className="column-count">{contacts.length}</span>
      </div>
      <div className="column-cards">
        {contacts.map((contact, index) => {
          const access = getAccess ? getAccess(contact) : null;
          const dragDisabled = access ? !access.canEdit : false;
          return (
            <Draggable
              key={contact.id}
              draggableId={contact.id}
              index={index}
              isDragDisabled={dragDisabled}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`draggable-card ${snapshot.isDragging ? 'dragging' : ''} ${
                    dragDisabled ? 'drag-disabled' : ''
                  }`}
                >
                  <ContactCard
                    contact={contact}
                    onUpdate={onCardUpdate}
                    access={access}
                    onOpen={onOpen}
                  />
                </div>
              )}
            </Draggable>
          );
        })}
      </div>
    </div>
  );
}
