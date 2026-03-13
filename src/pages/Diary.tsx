import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Lock, 
  Plus, 
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious';
  tags: string[];
}

interface DiarySettings {
  isLocked: boolean;
  passwordHash: string;
}

const Diary: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Debug logging
  console.log('Diary component state:', {
    isUnlocked,
    isSettingPassword,
    hasUser: !!user
  });
  
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral' as DiaryEntry['mood'],
    tags: [] as string[],
    tagInput: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if diary has password protection (only on mount)
    const settings = getDiarySettings();
    console.log('Diary settings:', settings);
    
    if (!settings.isLocked) {
      console.log('No password set, showing setup screen');
      setIsSettingPassword(true);
      setIsUnlocked(false);
    }
    // If locked and not unlocked, show unlock screen (already in initial state)
  }, [user, navigate]);

  // Load entries when unlocked
  useEffect(() => {
    if (isUnlocked && user) {
      console.log('Loading entries for user:', user._id);
      loadEntries();
    }
  }, [isUnlocked, user]);

  const getDiarySettings = (): DiarySettings => {
    const settings = localStorage.getItem(`diary_settings_${user?._id}`);
    return settings ? JSON.parse(settings) : { isLocked: false, passwordHash: '' };
  };

  const saveDiarySettings = (settings: DiarySettings) => {
    localStorage.setItem(`diary_settings_${user?._id}`, JSON.stringify(settings));
  };

  // Simple hash function for password (in production, use bcrypt or similar)
  const hashPassword = (pwd: string): string => {
    let hash = 0;
    for (let i = 0; i < pwd.length; i++) {
      const char = pwd.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  const handleSetPassword = () => {
    if (password.length < 4) {
      alert('Password must be at least 4 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    const passwordHash = hashPassword(password);
    console.log('Setting up password...');
    console.log('Password hash:', passwordHash);
    
    const settings: DiarySettings = {
      isLocked: true,
      passwordHash: passwordHash
    };
    
    saveDiarySettings(settings);
    console.log('Settings saved:', settings);
    console.log('Unlocking diary...');
    
    setIsSettingPassword(false);
    setIsUnlocked(true);
    setPassword('');
    setConfirmPassword('');
  };

  const handleUnlock = () => {
    const settings = getDiarySettings();
    const inputHash = hashPassword(password);
    
    console.log('Attempting unlock...');
    console.log('Stored hash:', settings.passwordHash);
    console.log('Input hash:', inputHash);
    console.log('Match:', inputHash === settings.passwordHash);
    
    if (inputHash === settings.passwordHash) {
      console.log('Password correct! Unlocking diary...');
      setIsUnlocked(true);
      setPassword('');
    } else {
      console.log('Password incorrect!');
      alert('Incorrect password');
      setPassword('');
    }
  };

  const loadEntries = () => {
    const stored = localStorage.getItem(`diary_entries_${user?._id}`);
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  };

  const saveEntries = (newEntries: DiaryEntry[]) => {
    localStorage.setItem(`diary_entries_${user?._id}`, JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const handleCreateEntry = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      date: new Date().toISOString(),
      mood: formData.mood,
      tags: formData.tags
    };

    const newEntries = [newEntry, ...entries];
    saveEntries(newEntries);
    resetForm();
    setIsCreating(false);
  };

  const handleUpdateEntry = () => {
    if (!selectedEntry) return;
    
    const updatedEntries = entries.map(entry =>
      entry.id === selectedEntry.id
        ? { ...entry, title: formData.title, content: formData.content, mood: formData.mood, tags: formData.tags }
        : entry
    );
    
    saveEntries(updatedEntries);
    setSelectedEntry(null);
    setIsEditing(false);
    resetForm();
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      const newEntries = entries.filter(entry => entry.id !== id);
      saveEntries(newEntries);
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      mood: 'neutral',
      tags: [],
      tagInput: ''
    });
  };

  const handleAddTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: ''
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    neutral: '😐',
    excited: '🤩',
    anxious: '😰'
  };

  const moodColors = {
    happy: 'bg-green-500/20 border-green-500/50 text-green-400',
    sad: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    neutral: 'bg-gray-500/20 border-gray-500/50 text-gray-400',
    excited: 'bg-cyan-400/20 border-cyan-400/50 text-cyan-300',
    anxious: 'bg-red-500/20 border-red-500/50 text-red-400'
  };

  // Password Setup Screen
  if (isSettingPassword) {
    return (
      <div className="min-h-screen bg-stress-dark flex items-center justify-center px-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border border-cyan-400/20">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-cyan-400/20 rounded-full">
              <Lock className="w-12 h-12 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Secure Your Diary</h2>
          <p className="text-white/70 text-center mb-6">
            Set a password to protect your personal thoughts and feelings
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-cyan-400 mb-2">Create Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-cyan-400/20 rounded-lg px-4 py-3 text-white pr-12"
                  placeholder="Enter a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/60 hover:text-cyan-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-cyan-400 mb-2">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/40 border border-cyan-400/20 rounded-lg px-4 py-3 text-white"
                placeholder="Re-enter your password"
              />
            </div>
            
            <button
              onClick={handleSetPassword}
              className="w-full bg-cyan-400 text-black py-3 rounded-lg font-semibold hover:bg-cyan-300 transition-colors"
            >
              Set Password & Continue
            </button>
            
            <p className="text-white/50 text-xs text-center">
              ⚠️ Remember this password! You'll need it to access your diary.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Password Unlock Screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-stress-dark flex items-center justify-center px-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border border-cyan-400/20">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-cyan-400/20 rounded-full">
              <BookOpen className="w-12 h-12 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h2>
          <p className="text-white/70 text-center mb-6">
            Enter your password to access your personal diary
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-cyan-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                  className="w-full bg-black/40 border border-cyan-400/20 rounded-lg px-4 py-3 text-white pr-12"
                  placeholder="Enter your password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/60 hover:text-cyan-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleUnlock}
              className="w-full bg-cyan-400 text-black py-3 rounded-lg font-semibold hover:bg-cyan-300 transition-colors"
            >
              Unlock Diary
            </button>
            
            <button
              onClick={() => navigate('/profile')}
              className="w-full text-cyan-400 py-2 hover:text-cyan-300 transition-colors"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Diary Interface
  return (
    <div className="min-h-screen bg-stress-dark pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">My Personal Diary</h1>
          </div>
          <button
            onClick={() => {
              setIsCreating(true);
              resetForm();
            }}
            className="flex items-center space-x-2 bg-cyan-400 text-black px-6 py-3 rounded-lg hover:bg-cyan-300 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>New Entry</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Entries List */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-cyan-400/20">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-cyan-400/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50"
                    placeholder="Search entries..."
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredEntries.length === 0 ? (
                  <p className="text-white/50 text-center py-8">No entries yet. Start writing!</p>
                ) : (
                  filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => {
                        setSelectedEntry(entry);
                        setIsCreating(false);
                        setIsEditing(false);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedEntry?.id === entry.id
                          ? 'bg-cyan-400/20 border border-cyan-400/50'
                          : 'bg-black/20 border border-cyan-400/10 hover:bg-black/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-white font-medium text-sm truncate flex-1">{entry.title}</h3>
                        <span className="text-2xl ml-2">{moodEmojis[entry.mood]}</span>
                      </div>
                      <p className="text-white/60 text-xs mb-2 line-clamp-2">{entry.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-400/70 text-xs flex items-center">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {format(new Date(entry.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Entry View/Edit */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20">
              {isCreating || isEditing ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {isCreating ? 'New Entry' : 'Edit Entry'}
                    </h2>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setIsEditing(false);
                        resetForm();
                      }}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-cyan-400 mb-2">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-black/40 border border-cyan-400/20 rounded-lg px-4 py-3 text-white"
                        placeholder="Give your entry a title..."
                      />
                    </div>

                    <div>
                      <label className="block text-cyan-400 mb-2">How are you feeling?</label>
                      <div className="grid grid-cols-5 gap-2">
                        {(Object.keys(moodEmojis) as Array<keyof typeof moodEmojis>).map((mood) => (
                          <button
                            key={mood}
                            type="button"
                            onClick={() => setFormData({ ...formData, mood })}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              formData.mood === mood
                                ? moodColors[mood]
                                : 'bg-black/20 border-cyan-400/10 hover:border-cyan-400/30'
                            }`}
                          >
                            <div className="text-3xl text-center">{moodEmojis[mood]}</div>
                            <div className="text-xs text-white/70 text-center mt-1 capitalize">{mood}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-cyan-400 mb-2">Content</label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full bg-black/40 border border-cyan-400/20 rounded-lg px-4 py-3 text-white min-h-[300px] resize-none"
                        placeholder="Pour your heart out..."
                      />
                    </div>

                    <div>
                      <label className="block text-cyan-400 mb-2">Tags</label>
                      <div className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={formData.tagInput}
                          onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          className="flex-1 bg-black/40 border border-cyan-400/20 rounded-lg px-4 py-2 text-white"
                          placeholder="Add tags (press Enter)"
                        />
                        <button
                          onClick={handleAddTag}
                          className="bg-cyan-400/20 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-400/30 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-cyan-400/20 text-cyan-400 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                          >
                            <span>{tag}</span>
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-cyan-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        onClick={() => {
                          setIsCreating(false);
                          setIsEditing(false);
                          resetForm();
                        }}
                        className="px-6 py-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={isCreating ? handleCreateEntry : handleUpdateEntry}
                        className="bg-cyan-400 text-black px-6 py-2 rounded-lg hover:bg-cyan-300 transition-colors font-semibold"
                      >
                        {isCreating ? 'Save Entry' : 'Update Entry'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedEntry ? (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-white">{selectedEntry.title}</h2>
                        <span className="text-4xl">{moodEmojis[selectedEntry.mood]}</span>
                      </div>
                      <p className="text-cyan-400/70 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {format(new Date(selectedEntry.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setFormData({
                            title: selectedEntry.title,
                            content: selectedEntry.content,
                            mood: selectedEntry.mood,
                            tags: selectedEntry.tags,
                            tagInput: ''
                          });
                          setIsEditing(true);
                        }}
                        className="p-2 bg-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/30 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(selectedEntry.id)}
                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {selectedEntry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedEntry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-cyan-400/20 text-cyan-400 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="bg-black/20 rounded-lg p-6 border border-cyan-400/10">
                    <p className="text-white whitespace-pre-wrap leading-relaxed">{selectedEntry.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <BookOpen className="w-16 h-16 text-cyan-400/50 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Entry Selected</h3>
                  <p className="text-white/60">Select an entry from the list or create a new one</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diary;
