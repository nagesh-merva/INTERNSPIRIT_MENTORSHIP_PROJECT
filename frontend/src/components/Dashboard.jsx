import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ user }) {
  const [tab, setTab] = useState(0);
  const [flashcards, setFlashcards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [openFlashcardDialog, setOpenFlashcardDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState({ topic: '', question: '', answer: '' });
  const [currentTask, setCurrentTask] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchFlashcards();
    fetchTasks();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/flashcards?user_id=${user.id}`);
      setFlashcards(response.data);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tasks?user_id=${user.id}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleFlashcardSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/flashcards', {
        ...currentFlashcard,
        user_id: user.id,
      });
      setOpenFlashcardDialog(false);
      fetchFlashcards();
      setCurrentFlashcard({ topic: '', question: '', answer: '' });
    } catch (error) {
      console.error('Error creating flashcard:', error);
    }
  };

  const handleTaskSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/tasks', {
        ...currentTask,
        user_id: user.id,
      });
      setOpenTaskDialog(false);
      fetchTasks();
      setCurrentTask({ title: '', description: '' });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  tab === 0
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setTab(0)}
              >
                Flashcards
              </button>
              <button
                className={`${
                  tab === 1
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setTab(1)}
              >
                Tasks
              </button>
            </nav>
          </div>

          {tab === 0 && (
            <div className="mt-6">
              <button
                onClick={() => setOpenFlashcardDialog(true)}
                className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Flashcard
              </button>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {flashcards.map((flashcard) => (
                  <div
                    key={flashcard.id}
                    className="bg-white overflow-hidden shadow rounded-lg"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        {flashcard.topic}
                      </h3>
                      <div className="mt-3">
                        <p className="text-sm text-gray-500">Question:</p>
                        <p className="mt-1 text-sm text-gray-900">{flashcard.question}</p>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-500">Answer:</p>
                        <p className="mt-1 text-sm text-gray-900">{flashcard.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 1 && (
            <div className="mt-6">
              <button
                onClick={() => setOpenTaskDialog(true)}
                className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Task
              </button>

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <li key={task.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {task.title}
                          </h3>
                          <div className="flex space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          {task.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Flashcard Dialog */}
          {openFlashcardDialog && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-lg font-medium mb-4">Add Flashcard</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Topic"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={currentFlashcard.topic}
                    onChange={(e) =>
                      setCurrentFlashcard({ ...currentFlashcard, topic: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Question"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={currentFlashcard.question}
                    onChange={(e) =>
                      setCurrentFlashcard({ ...currentFlashcard, question: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Answer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={currentFlashcard.answer}
                    onChange={(e) =>
                      setCurrentFlashcard({ ...currentFlashcard, answer: e.target.value })
                    }
                  />
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setOpenFlashcardDialog(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFlashcardSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Task Dialog */}
          {openTaskDialog && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-lg font-medium mb-4">Add Task</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={currentTask.title}
                    onChange={(e) =>
                      setCurrentTask({ ...currentTask, title: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Description"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={currentTask.description}
                    onChange={(e) =>
                      setCurrentTask({ ...currentTask, description: e.target.value })
                    }
                  />
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setOpenTaskDialog(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTaskSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;