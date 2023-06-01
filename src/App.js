import './App.css'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedMentor, setSelectedMentor] = useState('');
  const [assignedMentor, setAssignedMentor] = useState('');
  const [mentorStudents, setMentorStudents] = useState([]);
  const [previousMentor, setPreviousMentor] = useState('');


  useEffect(() => {
    // Fetch mentors and students on component mount
    fetchMentors();
    fetchStudents();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/mentors`);
      setMentors(response.data);
    } catch (error) {
      console.error('Failed to fetch mentors', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    }
  };

  const handleMentorCreate = async () => {
    const mentorName = prompt('Enter mentor name:');
    if (mentorName) {
      try {
        const response = await axios.post(`${API_BASE_URL}/mentors`, { name: mentorName });
        setMentors([...mentors, response.data]);
      } catch (error) {
        console.error('Failed to create mentor', error);
      }
    }
  };

  const handleStudentCreate = async () => {
    const studentName = prompt('Enter student name:');
    if (studentName) {
      try {
        const response = await axios.post(`${API_BASE_URL}/students`, { name: studentName });
        setStudents([...students, response.data]);
      } catch (error) {
        console.error('Failed to create student', error);
      }
    }
  };

  const handleAssignMentor = async (studentId, mentorId) => {
    try {
      await axios.post(`${API_BASE_URL}/students/${studentId}/mentor/${mentorId}`);
      fetchStudents();
    } catch (error) {
      console.error('Failed to assign mentor to student', error);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudent(studentId);
    setAssignedMentor('');
  };

  const handleSelectMentor = (mentorId) => {
    setSelectedMentor(mentorId);
  };

  const handleAssignMentorToStudent = async () => {
    if (selectedStudent && selectedMentor) {
      try {
        await axios.put(`${API_BASE_URL}/students/${selectedStudent}/mentor/${selectedMentor}`);
        fetchStudents();
        setAssignedMentor(selectedMentor);
      } catch (error) {
        console.error('Failed to assign/change mentor for student', error);
      }
    }
  };

  const handleShowStudentsForMentor = (mentorId) => {
    axios.get(`${API_BASE_URL}/mentors/${mentorId}/students`)
      .then((response) => {
        setMentorStudents(response.data);
      })
      .catch((error) => {
        console.error('Failed to fetch students for mentor', error);
      });
  };

  const handleShowPreviousMentor = (studentId) => {
    axios.get(`${API_BASE_URL}/students/${studentId}/previous-mentor`)
      .then((response) => {
        setPreviousMentor(response.data);
      })
      .catch((error) => {
        console.error('Failed to fetch previous mentor for student', error);
      });
  };

  return (
    <div className="container">
  <h2>Mentors</h2>
  <button onClick={handleMentorCreate}>Create Mentor</button>
  <ul>
    {mentors.map((mentor) => (
      <li key={mentor._id}>
        {mentor.name}
        <button onClick={() => handleShowStudentsForMentor(mentor._id)}>Show Students</button>
      </li>
    ))}
  </ul>

  <h2>Students</h2>
  <button onClick={handleStudentCreate}>Create Student</button>
  <ul>
    {students.map((student) => (
      <li key={student._id}>
        {student.name}
        {!student.mentor && (
          <select onChange={(e) => handleAssignMentor(student._id, e.target.value)}>
            <option value="">Assign Mentor</option>
            {mentors.map((mentor) => (
              <option key={mentor._id} value={mentor._id}>{mentor.name}</option>
            ))}
          </select>
        )}
        {student.mentor && (
          <div>
            Assigned Mentor: {student.mentor.name}
            <button onClick={() => handleShowPreviousMentor(student._id)}>Show Previous Mentor</button>
          </div>
        )}
      </li>
    ))}
  </ul>

  <h2>Assign Mentor to Student</h2>
  <div className="assign-mentor">
    <select value={selectedStudent} onChange={(e) => handleSelectStudent(e.target.value)}>
      <option value="">Select Student</option>
      {students.map((student) => (
        <option key={student._id} value={student._id}>{student.name}</option>
      ))}
    </select>
    <select value={selectedMentor} onChange={(e) => handleSelectMentor(e.target.value)}>
      <option value="">Select Mentor</option>
      {mentors.map((mentor) => (
        <option key={mentor._id} value={mentor._id}>{mentor.name}</option>
      ))}
    </select>
    <button onClick={handleAssignMentorToStudent}>Assign Mentor</button>
    {assignedMentor && <div>Mentor assigned: {mentors.find((mentor) => mentor._id === assignedMentor)?.name}</div>}
  </div>

  <h2>Show Students for Mentor</h2>
  <div className="show-students-for-mentor">
    <select value={selectedMentor} onChange={(e) => setSelectedMentor(e.target.value)}>
      <option value="">Select Mentor</option>
      {mentors.map((mentor) => (
        <option key={mentor._id} value={mentor._id}>{mentor.name}</option>
      ))}
    </select>
    <button onClick={() => handleShowStudentsForMentor(selectedMentor)}>Show Students</button>
    <ul>
      {mentorStudents.map((student) => (
        <li key={student._id}>{student.name}</li>
      ))}
    </ul>
  </div>

  <h2>Show Previous Mentor for Student</h2>
  <div className="show-previous-mentor">
    <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
      <option value="">Select Student</option>
      {students.map((student) => (
        <option key={student._id} value={student._id}>{student.name}</option>
      ))}
    </select>
    <button onClick={() => handleShowPreviousMentor(selectedStudent)}>Show Previous Mentor</button>
    {previousMentor && (
      <div>
        Previous Mentor: {previousMentor.name}
      </div>
    )}
  </div>
</div>

  );
}

export default App;
