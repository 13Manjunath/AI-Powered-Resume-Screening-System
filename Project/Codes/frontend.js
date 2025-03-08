import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResumeScreeningApp() {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleJobDescriptionChange = (e) => {
        setJobDescription(e.target.value);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please upload a resume file.");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("job_description", jobDescription);

        try {
            const response = await axios.post("http://localhost:5000/upload", formData); // Connected to Flask Backend
            setResult(response.data);
            setError('');
        } catch (err) {
            setError("Error uploading the resume. Please try again.");
        }
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/search?query=${searchQuery}`);
            setSearchResults(response.data);
        } catch (err) {
            setError("Error fetching search results.");
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">AI-Powered Resume Screening System</h1>

            <Card className="p-4 mb-4">
                <input type="file" onChange={handleFileChange} className="mb-2" />
                <textarea
                    placeholder="Enter Job Description"
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                    className="w-full p-2 border rounded"
                />
                <Button onClick={handleUpload} className="mt-2">Upload</Button>
            </Card>

            <Card className="p-4 mt-4">
                <input 
                    type="text" 
                    placeholder="Search by skill, score, or date" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <Button onClick={handleSearch} className="mt-2">Search</Button>
            </Card>

            {error && <p className="text-red-500">{error}</p>}

            {result && (
                <Card className="mt-4">
                    <CardContent>
                        <h2 className="text-xl font-bold">Results</h2>
                        <p><strong>Extracted Skills:</strong> {result.extracted_skills.join(", ")}</p>
                        <p><strong>Match Score:</strong> {result.match_score}%</p>
                    </CardContent>
                </Card>
            )}

            {searchResults.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold mb-2">Search Results</h2>
                    {searchResults.map((resume, index) => (
                        <Card key={index} className="mb-2">
                            <CardContent>
                                <p><strong>Filename:</strong> {resume.filename}</p>
                                <p><strong>Skills:</strong> {resume.extracted_skills.join(", ")}</p>
                                <p><strong>Match Score:</strong> {resume.match_score}%</p>
                                <p><strong>Date:</strong> {resume.uploaded_at}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
