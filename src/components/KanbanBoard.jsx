import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { supabase } from '../lib/supabaseClient';
import Column from './Column';
import './KanbanBoard.css';

const STAGES = ['New', 'To Call', 'Called', 'No Answer', 'For Demo', 'Done'];

export default function KanbanBoard({ contacts, onCardUpdate, getAccess, onOpen }) {
  function handleDragEnd(result) {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const contact = contacts.find((c) => c.id === draggableId);
    if (!contact) return;

    // Guard: never persist a status change the user isn't allowed to make.
    const access = getAccess ? getAccess(contact) : null;
    if (access && !access.canEdit) {
      return;
    }

    if (contact.status !== newStatus) {
      updateContactStatus(contact.id, newStatus);
    }
  }

  async function updateContactStatus(id, newStatus) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      onCardUpdate(data);
    } catch (error) {
      console.error('Error updating contact status:', error);
      alert('Failed to update contact status. You may not have permission to edit this contact.');
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {STAGES.map((stage) => {
          const stageContacts = contacts.filter(
            (c) => c.status?.toLowerCase() === stage.toLowerCase()
          );
          return (
            <Droppable key={stage} droppableId={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`droppable-zone ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                >
                  <Column
                    stage={stage}
                    contacts={stageContacts}
                    onCardUpdate={onCardUpdate}
                    getAccess={getAccess}
                    onOpen={onOpen}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
