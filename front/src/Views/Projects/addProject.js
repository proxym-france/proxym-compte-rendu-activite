import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';


const AddProject = () => {
  const [code, setCode] = useState('');
  const [selectedCollabs, setSelectedCollabs] = useState([]);
  const [allCollabs, setAllCollabs] = useState([]);
  const [name, setName] = useState(''); 
  const [client, setClient] = useState(''); 
  const [date, setDate] = useState(new Date());
  const apiUrl = process.env.REACT_APP_API_URL;
  const getTokenFromLocalStorage = () => {
    const token = localStorage.getItem('token');
    return token;
  };
  const token = getTokenFromLocalStorage();
  const navigate=useNavigate();
  useEffect(() => {
    const fetchCollabs = async () => {
      try {
        const response = await fetch(`${apiUrl}/collab/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if(response.status === 401)
            {
              navigate('/login');
    
            }
        setAllCollabs(data);
      } catch (error) {
        console.error('Error fetching collabs:', error);
      }
    };

    fetchCollabs();
  }, []);

  const handleAddProject = async () => {
    const status='Active';
    const projectData = {
      code,
      collabs: selectedCollabs.map((collab) => collab._email),
      name,
      client, 
      date:date.toISOString(),
      status,
    };

    try {
      const response = await fetch(`${apiUrl}/project/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        console.log('Project added successfully!');
        toast.success('Project added successfully!');
        /* setTimeout(() => {
           history.push('/projects');
         }, 2000);*/
      } else {
        console.error('Error adding project:', response);
      }
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)', borderRadius: '10px', backgroundColor: '#E8F4FD', width: '60%' }}>
      <h1>Ajouter un Projet</h1>
      <br />
      <strong>Code du projet:</strong>
      <br />
      <TextField
        label="Code du Projet"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ marginBottom: '16px', width: '60%' }}
      />
      <br />
      <strong>Nom du projet:</strong> {/* New attribute */}
      <br />
      <TextField
        label="Nom du Projet"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginBottom: '16px', width: '60%' }}
      />
      <br />
      <strong>Client:</strong> {/* New attribute */}
      <br />
      <TextField
        label="Client"
        value={client}
        onChange={(e) => setClient(e.target.value)}
        style={{ marginBottom: '16px', width: '60%' }}
      />
      <br />
      <strong>Date du projet:</strong> {/* New attribute */}
      <br />
      <TextField
        label="Date"
        type="date" // Use "date" type for date input
        value={date.toISOString().substr(0, 10)} // Format the date
        onChange={(e) => setDate(new Date(e.target.value))}
        style={{ marginBottom: '16px', width: '60%' }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <br />
      <strong>Les collaborateurs:</strong>
      <br />
      <Autocomplete
        multiple
        options={allCollabs}
        getOptionLabel={(option) => option._email}
        value={selectedCollabs}
        onChange={(event, newValue) => setSelectedCollabs(newValue)}
        filterSelectedOptions
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip label={option._email} {...getTagProps({ index })} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Collaborateurs"
            placeholder="Sélectionnez les collaborateurs"
            style={{ width: '60%' }}
          />
        )}
      />
      <br />
      <Button variant="contained" color="primary" onClick={handleAddProject} style={{ marginTop: '16px', width: '50%' }}>
        Ajouter
      </Button>
      <Link to="/projects" ><Button variant="outlined" startIcon={<FaArrowLeft />} style={{ marginTop: '16px' }}>Annuler</Button></Link>

    </div>
  );
};

export default AddProject;
