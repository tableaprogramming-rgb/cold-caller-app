import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import KanbanBoard from './components/KanbanBoard';
import SearchBar from './components/SearchBar';
import './App.css';

function App() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('contacts').select('*');

      if (error) throw error;
      setContacts(data || []);
      setFilteredContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(query) {
    if (!query.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = contacts.filter(
      (contact) =>
        contact.company.toLowerCase().includes(lowerQuery) ||
        (contact.contact_person && contact.contact_person.toLowerCase().includes(lowerQuery)) ||
        (contact.contact_number && contact.contact_number.includes(query))
    );

    setFilteredContacts(filtered);
  }

  function handleCardUpdate(updatedCard) {
    const newContacts = contacts.map((c) => (c.id === updatedCard.id ? updatedCard : c));
    setContacts(newContacts);
    handleSearch('');
  }

  if (loading) {
    return <div className="loading">Loading contacts...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cold Calling Tracker</h1>
        <p>Total contacts: {contacts.length}</p>
      </header>

      <div className="app-content">
        <SearchBar onSearch={handleSearch} />
        <KanbanBoard contacts={filteredContacts} onCardUpdate={handleCardUpdate} />
      </div>
    </div>
  );
}

export default App;
