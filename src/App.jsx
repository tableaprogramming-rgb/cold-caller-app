import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './lib/supabaseClient';
import { getUserProfile, isPasswordChangeRequired, signOut } from './lib/authHelpers';
import { getContactAccess } from './lib/access';
import KanbanBoard from './components/KanbanBoard';
import TableView from './components/TableView';
import SearchBar from './components/SearchBar';
import DetailModal from './components/DetailModal';
import NewContactModal from './components/NewContactModal';
import ProtectedRoute from './components/ProtectedRoute';
import FirstLoginModal from './components/FirstLoginModal';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import './App.css';

function App() {
  // --- auth state ---
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  // --- view state ---
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [appView, setAppView] = useState('board'); // 'board' | 'table'
  const [route, setRoute] = useState('app'); // 'app' | 'settings'
  const [selectedContact, setSelectedContact] = useState(null);
  const [showNewContactModal, setShowNewContactModal] = useState(false);

  // --- data state ---
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [sharedRoleByOwner, setSharedRoleByOwner] = useState(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  // -------------------------------------------------------------------------
  // Auth session bootstrap + listener
  // -------------------------------------------------------------------------
  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data?.session || null);
      setUser(data?.session?.user || null);
      setAuthLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null);
      setUser(newSession?.user || null);
      if (!newSession) {
        // Reset app state on logout.
        setProfile(null);
        setNeedsPasswordChange(false);
        setContacts([]);
        setFilteredContacts([]);
        setRoute('app');
      }
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  // -------------------------------------------------------------------------
  // Load profile (first-login detection) whenever the user changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await getUserProfile(user.id);
      if (!active) return;
      setProfile(data);
      setNeedsPasswordChange(isPasswordChangeRequired(data));
    })();
    return () => {
      active = false;
    };
  }, [user]);

  // -------------------------------------------------------------------------
  // Fetch contacts + sharing map once authenticated and past first-login gate
  // -------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    setDataError('');
    try {
      // Roles for contacts shared WITH me (owner_id -> role).
      const { data: accessRows, error: accessError } = await supabase
        .from('contact_access')
        .select('owner_id, role')
        .eq('shared_with_id', user.id);
      if (accessError) throw accessError;

      const roleMap = new Map();
      (accessRows || []).forEach((r) => roleMap.set(r.owner_id, r.role));
      setSharedRoleByOwner(roleMap);

      // RLS returns only contacts I own or that are shared with me.
      const { data, error } = await supabase.from('contacts').select('*');
      if (error) throw error;

      setContacts(data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setDataError('Failed to load contacts. Please refresh.');
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !needsPasswordChange) {
      fetchData();
    }
  }, [user, needsPasswordChange, fetchData]);

  // -------------------------------------------------------------------------
  // Search filtering (re-run when contacts or query change)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredContacts(contacts);
      return;
    }
    setFilteredContacts(
      contacts.filter(
        (c) =>
          c.company?.toLowerCase().includes(q) ||
          (c.contact_person && c.contact_person.toLowerCase().includes(q)) ||
          (c.contact_number && c.contact_number.includes(searchQuery.trim()))
      )
    );
  }, [contacts, searchQuery]);

  // -------------------------------------------------------------------------
  // Access helper bound to current user + sharing map
  // -------------------------------------------------------------------------
  const getAccess = useCallback(
    (contact) => getContactAccess(contact, user?.id, sharedRoleByOwner),
    [user, sharedRoleByOwner]
  );

  const ownedCount = useMemo(
    () => contacts.filter((c) => c.user_id === user?.id).length,
    [contacts, user]
  );

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  function handleSearch(query) {
    setSearchQuery(query);
  }

  function handleCardUpdate(updated) {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedContact((prev) => (prev && prev.id === updated.id ? updated : prev));
  }

  async function handleTableStatusChange(id, status) {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
    const access = getAccess(contact);
    if (!access.canEdit) return;
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      handleCardUpdate(data);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. You may not have permission to edit this contact.');
    }
  }

  async function handleLogout() {
    await signOut();
    // onAuthStateChange handles the rest.
  }

  function handleContactAdded(newContact) {
    setContacts((prev) => [...prev, newContact]);
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (authLoading) {
    return <div className="loading">Loading…</div>;
  }

  // Not authenticated → auth screens.
  const authFallback =
    authView === 'register' ? (
      <RegisterPage
        onSuccess={() => setAuthView('login')}
        onGoToLogin={() => setAuthView('login')}
      />
    ) : (
      <LoginPage
        onSuccess={() => { /* session listener updates state */ }}
        onGoToRegister={() => setAuthView('register')}
      />
    );

  return (
    <ErrorBoundary onReset={() => window.location.reload()}>
      <ProtectedRoute user={user} fallback={authFallback}>
        {needsPasswordChange ? (
          <FirstLoginModal
            onComplete={() => {
              setNeedsPasswordChange(false);
              setProfile((p) => (p ? { ...p, password_change_required: false } : p));
            }}
          />
        ) : route === 'settings' ? (
          <AccountSettingsPage onBack={() => { setRoute('app'); fetchData(); }} />
        ) : (
          <div className="app">
            <header className="app-header" data-session={session ? 'active' : 'none'}>
              <div className="header-left">
                <h1>Cold Calling Tracker</h1>
                <p>
                  {contacts.length} contact{contacts.length === 1 ? '' : 's'} visible • {ownedCount} owned
                </p>
              </div>
              <div className="header-right">
                <span className="header-username">
                  {profile?.username || user?.user_metadata?.username || 'Account'}
                </span>
                <button className="header-btn" onClick={() => setRoute('settings')}>
                  Account
                </button>
                <button className="header-btn header-logout" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            </header>

            <div className="app-toolbar">
              <SearchBar onSearch={handleSearch} />
              <div className="view-toggle">
                <button
                  className={appView === 'board' ? 'active' : ''}
                  onClick={() => setAppView('board')}
                >
                  Board
                </button>
                <button
                  className={appView === 'table' ? 'active' : ''}
                  onClick={() => setAppView('table')}
                >
                  Table
                </button>
              </div>
              <button className="add-contact-btn" onClick={() => setShowNewContactModal(true)}>
                + Add Contact
              </button>
            </div>

            <div className="app-content">
              {dataError && <div className="data-error">{dataError}</div>}
              {dataLoading ? (
                <div className="loading">Loading contacts…</div>
              ) : appView === 'board' ? (
                <KanbanBoard
                  contacts={filteredContacts}
                  onCardUpdate={handleCardUpdate}
                  getAccess={getAccess}
                  onOpen={setSelectedContact}
                />
              ) : (
                <TableView
                  contacts={filteredContacts}
                  getAccess={getAccess}
                  onStatusChange={handleTableStatusChange}
                  onOpen={setSelectedContact}
                />
              )}
            </div>

            {selectedContact && (
              <DetailModal
                contact={selectedContact}
                access={getAccess(selectedContact)}
                onClose={() => setSelectedContact(null)}
                onUpdate={handleCardUpdate}
              />
            )}

            {showNewContactModal && (
              <NewContactModal
                user={user}
                onClose={() => setShowNewContactModal(false)}
                onContactAdded={handleContactAdded}
              />
            )}
          </div>
        )}
      </ProtectedRoute>
    </ErrorBoundary>
  );
}

export default App;
