import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateLessons.css";

function CreateLesson() {
  const [user, setUser] = useState(null);

  // Lesson form state
  const [lessonData, setLessonData] = useState({
    lesson_title: "",
    lesson_desc: "",
    lesson_obj: "",
    lesson_effort_per_week: "",
    lesson_credit: "",
    lesson_status: "draft",
    lesson_reading_list: [],
    lesson_assignment: [],
    lesson_prereq: []
  });

  // For managing prerequisites
  const [availableLessons, setAvailableLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Load user + published lessons for prerequisites
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    fetchPublishedLessons();
  }, []);

  const fetchPublishedLessons = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/lessons/published");
      const data = await response.json();
      if (response.ok) {
        // Flatten lessons array from courses
        const lessons = data.data.flatMap((c) => c.lessons);
        setAvailableLessons(lessons);
      }
    } catch (err) {
      console.error("Error fetching published lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for lesson details
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLessonData((prev) => ({ ...prev, [name]: value }));
  };

  // Reading list management
  const addReadingItem = (item) => {
    if (item.trim() === "") return;
    setLessonData((prev) => ({
      ...prev,
      lesson_reading_list: [...prev.lesson_reading_list, item]
    }));
  };

  const removeReadingItem = (index) => {
    setLessonData((prev) => ({
      ...prev,
      lesson_reading_list: prev.lesson_reading_list.filter((_, i) => i !== index)
    }));
  };

  // Assignment management
  const addAssignment = (item) => {
    if (item.trim() === "") return;
    setLessonData((prev) => ({
      ...prev,
      lesson_assignment: [...prev.lesson_assignment, item]
    }));
  };

  const removeAssignment = (index) => {
    setLessonData((prev) => ({
      ...prev,
      lesson_assignment: prev.lesson_assignment.filter((_, i) => i !== index)
    }));
  };

  // Prerequisite management
  const addPrereq = (lesson) => {
    if (!lessonData.lesson_prereq.find((l) => l.lesson_id === lesson.lesson_id)) {
      setLessonData((prev) => ({
        ...prev,
        lesson_prereq: [...prev.lesson_prereq, lesson]
      }));
    }
  };

  const removePrereq = (lessonId) => {
    setLessonData((prev) => ({
      ...prev,
      lesson_prereq: prev.lesson_prereq.filter((l) => l.lesson_id !== lessonId)
    }));
  };

  // Save lesson (draft or publish)
  const handleSave = async (status) => {
    try {
      const payload = {
        ...lessonData,
        lesson_status: status,
        lesson_designer: user?.user_id ?? 1, // fallback mock id
      };

      const response = await fetch("http://localhost:5000/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to save lesson");
      }

      alert(`Lesson ${status === "published" ? "published" : "saved"} successfully!`);
      navigate("/lessons");
    } catch (err) {
      console.error("Error saving lesson:", err);
      alert("Error saving lesson. Try again.");
    }
  };

  const filteredLessons = availableLessons.filter(
    (lesson) =>
      lesson.lesson_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Temporary input states for reading + assignment
  const [readingInput, setReadingInput] = useState("");
  const [assignmentInput, setAssignmentInput] = useState("");

  return (
    <div className="create-lesson-container">
      <h1>Create Lesson</h1>

      {/* Lesson Details */}
      <div className="lesson-form">
        <input
          type="text"
          name="lesson_title"
          placeholder="Lesson Title"
          value={lessonData.lesson_title}
          onChange={handleChange}
        />
        <textarea
          name="lesson_desc"
          placeholder="Lesson Description"
          value={lessonData.lesson_desc}
          onChange={handleChange}
        />
        <textarea
          name="lesson_obj"
          placeholder="Learning Objectives"
          value={lessonData.lesson_obj}
          onChange={handleChange}
        />
        <input
          type="number"
          name="lesson_effort_per_week"
          placeholder="Effort per week (hrs)"
          value={lessonData.lesson_effort_per_week}
          onChange={handleChange}
        />
        <input
          type="number"
          name="lesson_credit"
          placeholder="Credits"
          value={lessonData.lesson_credit}
          onChange={handleChange}
        />
      </div>

      {/* Reading List */}
      <div className="reading-section">
        <h3>Reading List</h3>
        <ul>
          {lessonData.lesson_reading_list.map((item, i) => (
            <li key={i}>
              {item} <button onClick={() => removeReadingItem(i)}>×</button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="Add reading item"
          value={readingInput}
          onChange={(e) => setReadingInput(e.target.value)}
        />
        <button
          onClick={() => {
            addReadingItem(readingInput);
            setReadingInput("");
          }}
        >
          Add
        </button>
      </div>

      {/* Assignments */}
      <div className="assignment-section">
        <h3>Assignments</h3>
        <ul>
          {lessonData.lesson_assignment.map((item, i) => (
            <li key={i}>
              {item} <button onClick={() => removeAssignment(i)}>×</button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="Add assignment"
          value={assignmentInput}
          onChange={(e) => setAssignmentInput(e.target.value)}
        />
        <button
          onClick={() => {
            addAssignment(assignmentInput);
            setAssignmentInput("");
          }}
        >
          Add
        </button>
      </div>

      {/* Prerequisites */}
      <div className="prereq-section">
        <h3>Prerequisites</h3>
        <ul>
          {lessonData.lesson_prereq.map((lesson) => (
            <li key={lesson.lesson_id}>
              {lesson.lesson_title}{" "}
              <button onClick={() => removePrereq(lesson.lesson_id)}>×</button>
            </li>
          ))}
        </ul>

        <input
          type="text"
          placeholder="Search lessons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading ? (
          <p>Loading lessons...</p>
        ) : (
          <div className="available-lessons">
            {filteredLessons.map((lesson) => (
              <div key={lesson.lesson_id}>
                {lesson.lesson_title}
                <button onClick={() => addPrereq(lesson)}>+</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="actions">
        <button onClick={() => handleSave("draft")}>Save as Draft</button>
        <button onClick={() => handleSave("published")}>Publish</button>
        <button onClick={() => navigate("/lessons")}>Cancel</button>
      </div>
    </div>
  );
}

export default CreateLesson;
