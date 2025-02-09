import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ user }) {
  const [tab, setTab] = useState(0);
  const [flashcardsByTopic, setFlashcardsByTopic] = useState({})
  const [tasks, setTasks] = useState([]);
  const [openFlashcardDialog, setOpenFlashcardDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState({ topic: '', question: '', answer: '' });
  const [currentTask, setCurrentTask] = useState({
    title: "",
    description: "",
    importance: "Mid",
    deadline: "",
  });

  useEffect(() => {
    fetchFlashcards();
    fetchTasks();
  }, [])

  const groupFlashcardsByTopic = (flashcards) => {
    return flashcards.reduce((acc, card) => {
      if (!acc[card.topic]) {
        acc[card.topic] = [];
      }
      acc[card.topic].push(card);
      return acc;
    }, {});
  };


  const fetchFlashcards = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/flashcards?user_id=${user}`);
      const groupedFlashcards = groupFlashcardsByTopic(response.data);
      setFlashcardsByTopic(groupedFlashcards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tasks?user_id=${user}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleFlashcardSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/flashcards', {
        ...currentFlashcard,
        user_id: user,
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
      const newTask = {
        ...currentTask,
        user_id: user, // Ensure user_id is included
        status: "pending",
        created_at: new Date().toISOString(),
      };

      await axios.post("http://localhost:5000/api/tasks", newTask);
      setOpenTaskDialog(false);
      fetchTasks();
      setCurrentTask({ title: "", description: "", importance: "Mid", deadline: "" });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  const markTaskAsDone = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}`)
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  const HandleDeleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`)
      fetchTasks()
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const toggleAnswer = (id) => {
    const answerElement = document.getElementById(`answer-${id}`);
    if (answerElement) {
      answerElement.classList.toggle("hidden");
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
                className={`${tab === 0
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setTab(0)}
              >
                Flashcards
              </button>
              <button
                className={`${tab === 1
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
                className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Flashcard
              </button>

              <div className="space-y-6">
                {Object.keys(flashcardsByTopic).map((topic) => (
                  <div key={topic} className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{topic}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {flashcardsByTopic[topic].map((flashcard) => (
                        <div key={flashcard._id} className="bg-gray-100 rounded-lg p-4 shadow">
                          <p className="text-gray-700 font-medium">Q: {flashcard.question}</p>
                          <button
                            className="text-indigo-600 mt-2 block hover:text-indigo-800"
                            onClick={() => toggleAnswer(flashcard.id)}
                          >
                            View Answer
                          </button>
                          <p
                            id={`answer-${flashcard.id}`}
                            className="hidden text-gray-900 font-semibold mt-2"
                          >
                            {flashcard.answer}
                          </p>
                        </div>
                      ))}
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
                    <li key={task._id} className="bg-white shadow rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            <strong>Importance:</strong> <span className={`font-bold ${task.importance === "High" ? "text-red-500" : task.importance === "Mid" ? "text-yellow-500" : "text-green-500"}`}>{task.importance}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            <span className={`px-2 py-1 rounded-full ${task.status === "pending" ? "bg-yellow-200 text-yellow-800" : "bg-green-200 text-green-800"}`}>
                              {task.status}
                            </span>
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {task.status === "pending" && (
                            <button className="px-3 py-1 text-blue-600 hover:text-blue-900 border border-blue-600 rounded-md" onClick={() => markTaskAsDone(task.id)}>
                              Mark as Done
                            </button>
                          )}
                          <button className="px-3 py-1 text-red-600 hover:text-red-900 border border-red-600 rounded-md" onClick={() => HandleDeleteTask(task.id)}>
                            Delete
                          </button>
                        </div>
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
                    onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Description"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={currentTask.description}
                    onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                  />
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={currentTask.importance}
                    onChange={(e) => setCurrentTask({ ...currentTask, importance: e.target.value })}
                  >
                    <option value="High">High</option>
                    <option value="Mid">Mid</option>
                    <option value="Low">Low</option>
                  </select>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={currentTask.deadline}
                    onChange={(e) => setCurrentTask({ ...currentTask, deadline: e.target.value })}
                  />
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button onClick={() => setOpenTaskDialog(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500">
                    Cancel
                  </button>
                  <button onClick={handleTaskSubmit} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
                    Add Task
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